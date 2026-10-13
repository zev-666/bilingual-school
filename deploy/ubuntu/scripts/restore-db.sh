#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# restore-db.sh — 把 Neon 雲端資料庫搬到本機 PostgreSQL（搬家時執行一次）
#
# 用法：
#   ① 匯出（在主機上直接從 Neon 抓，需能連外到 Neon 的 5432 埠）：
#        sudo bash restore-db.sh export "postgresql://帳號:密碼@ep-xxx.neon.tech/neondb?sslmode=require"
#      → 產生 /srv/eerc/backups/neon-<時間>.dump
#
#      若主機連不到 Neon，請在可連線的電腦上執行（PostgreSQL 16 的 pg_dump）：
#        pg_dump --format=custom --no-owner --no-privileges -d "<Neon 連線字串>" -f neon.dump
#      再把 neon.dump 傳到主機。
#
#   ② 匯入本機資料庫（目標＝/srv/eerc/shared/.env 的 DATABASE_URL）：
#        sudo bash restore-db.sh import /srv/eerc/backups/neon-<時間>.dump
#
# ⚠️ import 會「清空」本機資料庫後再匯入。正式上線後不要再跑 import，除非是災難復原。
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE="/srv/eerc"
ENV_FILE="${BASE}/shared/.env"
die() { printf '❌ %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "請用 sudo 執行"
MODE="${1:-}"; ARG="${2:-}"

case "${MODE}" in
  export)
    [[ -n "${ARG}" ]] || die "請提供 Neon 連線字串"
    OUT="${BASE}/backups/neon-$(date +%Y%m%d-%H%M%S).dump"
    echo "▶ 從 Neon 匯出 → ${OUT}"
    pg_dump --format=custom --no-owner --no-privileges -d "${ARG}" -f "${OUT}"
    chmod 600 "${OUT}"
    echo "✅ 匯出完成：$(du -h "${OUT}" | cut -f1)"
    echo "   備份內容："
    pg_restore --list "${OUT}" | grep -c "TABLE DATA" | sed 's/^/   資料表區段數 /'
    ;;

  import)
    [[ -f "${ARG}" ]] || die "找不到備份檔 ${ARG}"
    [[ -f "${ENV_FILE}" ]] || die "找不到 ${ENV_FILE}"
    set -a
    # shellcheck disable=SC1090
    . "${ENV_FILE}"
    set +a
    PG_URL="${DATABASE_URL%%\?*}"

    echo "⚠ 這會清空本機資料庫再匯入 ${ARG}"
    read -r -p "  確定要繼續？輸入 YES： " ans
    [[ "${ans}" == "YES" ]] || die "已取消"

    echo "▶ 匯入中…"
    # --clean --if-exists：先刪除同名物件；--no-owner：一律歸目前帳號（eerc）所有
    pg_restore --clean --if-exists --no-owner --no-privileges --single-transaction -d "${PG_URL}" "${ARG}"

    echo "▶ 驗證筆數"
    for t in announcements documents albums photos videos teachers users calendar_events site_settings _prisma_migrations; do
      n="$(psql "${PG_URL}" -tAc "SELECT count(*) FROM \"${t}\"" 2>/dev/null || echo '（無此表）')"
      printf '   %-20s %s\n' "${t}" "${n}"
    done
    echo
    echo "✅ 匯入完成。請和 Neon 上的筆數核對（參考：公告 10、文件 177、相簿 65、照片 709、影片 26、團隊 14）"
    echo "   接著可執行 deploy.sh 部署網站。"
    ;;

  *)
    sed -n '2,20p' "$0"
    exit 1
    ;;
esac
