#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — 部署新版本（每次更新網站都用這支）
#
# 用法：sudo bash deploy.sh [分支或 tag，預設 master]
#   例：sudo bash /srv/eerc/current/deploy/ubuntu/scripts/deploy.sh
#       sudo bash /srv/eerc/current/deploy/ubuntu/scripts/deploy.sh v2026.10.20
#
# 流程（任何一步失敗，正在服務的舊版本都不受影響）：
#   1. 把指定版本下載到 /srv/eerc/releases/<時間>（不覆蓋正在跑的版本）
#   2. 安裝套件、檢查設定、套用資料庫異動、建置
#   3. 同步 git 內的搬遷檔案到 /srv/eerc/uploads（只新增、不刪除後台上傳的檔）
#   4. 切換 /srv/eerc/current → 新版本，重啟服務
#   5. 健康檢查：失敗就自動切回上一版
#   6. 只保留最近 5 個版本
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/zev-666/bilingual-school.git}"
REF="${1:-master}"
BASE="/srv/eerc"
APP_USER="eerc"
ENV_FILE="${BASE}/shared/.env"
KEEP=5
HEALTH_URL="http://127.0.0.1:3000/zh-TW"

log() { printf '\n▶ %s\n' "$*"; }
die() { printf '\n❌ %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "請用 sudo 執行"
[[ -f "${ENV_FILE}" ]] || die "找不到 ${ENV_FILE}，請先依 env.production.example 建立"

# 載入設定（只在這支腳本內有效）
set -a
# shellcheck disable=SC1090
. "${ENV_FILE}"
set +a

log "檢查設定"
[[ -n "${DATABASE_URL:-}" ]] || die "DATABASE_URL 未設定"
[[ ${#JWT_SECRET} -ge 32 ]] || die "JWT_SECRET 少於 32 字元（網站會刻意拒絕啟動）"
[[ -n "${UPLOAD_DIR:-}" ]] || die "UPLOAD_DIR 未設定"
[[ "${PUBLIC_ORIGIN:-}" == https://* ]] || die "PUBLIC_ORIGIN 未設定或不是 https://（轉址會跑到 localhost）"
if [[ -n "${BLOB_READ_WRITE_TOKEN:-}" || -n "${AWS_S3_BUCKET:-}" ]]; then
  die "正式主機不可設定 BLOB_READ_WRITE_TOKEN／AWS_S3_BUCKET（上傳檔會被送到外部雲端）"
fi
echo "  設定檢查通過"

TS="$(date +%Y%m%d-%H%M%S)"
NEW="${BASE}/releases/${TS}"
# 上一版：只有 current 已經是捷徑時才有（第一次部署沒有上一版）
PREV=""
if [[ -L "${BASE}/current" ]]; then
  PREV="$(readlink -f "${BASE}/current")"
fi

log "下載版本 ${REF} → ${NEW}"
git clone --quiet --depth 1 --branch "${REF}" "${REPO_URL}" "${NEW}"
COMMIT="$(git -C "${NEW}" rev-parse --short HEAD)"
echo "  commit ${COMMIT}"
chown -R "${APP_USER}:${APP_USER}" "${NEW}"

run_as_app() { sudo -u "${APP_USER}" --preserve-env=DATABASE_URL,JWT_SECRET,UPLOAD_DIR,PUBLIC_ORIGIN,NEXT_PUBLIC_SITE_URL,SITE_NAME,NODE_ENV bash -c "cd '${NEW}' && $*"; }

log "安裝套件（npm ci）"
run_as_app "npm ci --no-audit --no-fund"

log "檢查資料庫"
# 本專案的 migration 歷史與資料表命名有世代落差（見 handoff-summary.md 第二部分）：
# 空的資料庫「不可以」用 migrate deploy 從頭建立，必須先用 restore-db.sh 匯入 Neon 的完整備份。
PG_URL="${DATABASE_URL%%\?*}"   # psql 不認得 ?schema=public，去掉查詢參數
has_table="$(psql "${PG_URL}" -tAc "SELECT to_regclass('public._prisma_migrations') IS NOT NULL" 2>/dev/null || echo error)"
case "${has_table}" in
  t) echo "  資料庫連線正常，已有 migration 紀錄" ;;
  f) die "資料庫是空的（沒有 _prisma_migrations 表）：請先用 restore-db.sh 匯入資料，不要從頭建立" ;;
  *) die "連不上資料庫，請檢查 ${ENV_FILE} 的 DATABASE_URL 與 PostgreSQL 是否啟動" ;;
esac

log "套用新的資料庫異動（prisma migrate deploy，只會套用尚未執行過的）"
run_as_app "npx prisma migrate deploy"

log "建置（npm run build）"
run_as_app "NODE_ENV=production npm run build"

log "同步搬遷檔案到 ${UPLOAD_DIR}"
# 只新增／更新 git 內的固定檔案；不加 --delete，後台上傳的檔案不會被刪
rsync -a --chown="${APP_USER}:${APP_USER}" "${NEW}/public/uploads/" "${UPLOAD_DIR}/"

log "切換版本並重啟"
ln -sfn "${NEW}" "${BASE}/current"
systemctl restart eerc-web

log "健康檢查"
ok=0
for _ in $(seq 1 30); do
  sleep 2
  code="$(curl -s -o /dev/null -w '%{http_code}' "${HEALTH_URL}" || true)"
  if [[ "${code}" == "200" ]]; then ok=1; break; fi
done

if [[ ${ok} -ne 1 ]]; then
  echo "  ✗ 新版本沒有正常回應（最後狀態碼 ${code:-無}）"
  if [[ -n "${PREV}" && -d "${PREV}" ]]; then
    ln -sfn "${PREV}" "${BASE}/current"
    systemctl restart eerc-web
    die "已自動切回上一版 $(basename "${PREV}")。請看紀錄：journalctl -u eerc-web -n 100"
  fi
  die "這是第一次部署，沒有上一版可切回。請看紀錄：journalctl -u eerc-web -n 100"
fi
echo "  ✓ ${HEALTH_URL} 回應 200"

log "清理舊版本（保留最近 ${KEEP} 個）"
mapfile -t olds < <(find "${BASE}/releases" -mindepth 1 -maxdepth 1 -type d | sort | head -n -"${KEEP}")
for d in "${olds[@]}"; do
  [[ "$(readlink -f "${BASE}/current")" == "${d}" ]] && continue
  rm -rf "${d}"
  echo "  刪除 $(basename "${d}")"
done

printf '\n✅ 部署完成：%s（commit %s）\n' "${TS}" "${COMMIT}"
echo "${TS} ${COMMIT} ${REF}" >> "${BASE}/deploy-history.log"
