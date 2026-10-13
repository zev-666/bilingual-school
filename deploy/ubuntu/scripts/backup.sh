#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# backup.sh — 每日備份資料庫與上傳檔案
#
# 安裝排程（每天凌晨 2:30）：
#   sudo cp deploy/ubuntu/scripts/backup.sh /usr/local/sbin/eerc-backup && sudo chmod 700 /usr/local/sbin/eerc-backup
#   echo '30 2 * * * root /usr/local/sbin/eerc-backup >> /var/log/eerc-backup.log 2>&1' | sudo tee /etc/cron.d/eerc-backup
#
# 保留：每日 14 份＋每月 1 號那份保留 12 個月。
# ⚠️ 備份放在同一台主機上不算真正的備份。請廠商依合約另外複製到異地（例如 rsync 到另一台主機）。
#    設定 OFFSITE_TARGET（例如 backup@10.0.0.5:/backups/eerc/）就會自動複製。
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE="/srv/eerc"
DEST="${BASE}/backups"
ENV_FILE="${BASE}/shared/.env"
OFFSITE_TARGET="${OFFSITE_TARGET:-}"

set -a
# shellcheck disable=SC1090
. "${ENV_FILE}"
set +a
PG_URL="${DATABASE_URL%%\?*}"

TS="$(date +%Y%m%d-%H%M%S)"
umask 077

echo "[$(date '+%F %T')] 開始備份 ${TS}"

DB_FILE="${DEST}/db-${TS}.dump"
pg_dump --format=custom --no-owner -d "${PG_URL}" -f "${DB_FILE}"
pg_restore --list "${DB_FILE}" >/dev/null   # 驗證備份檔可讀

UP_FILE="${DEST}/uploads-${TS}.tar.gz"
tar -czf "${UP_FILE}" -C "$(dirname "${UPLOAD_DIR}")" "$(basename "${UPLOAD_DIR}")"
tar -tzf "${UP_FILE}" >/dev/null             # 驗證壓縮檔可讀

( cd "${DEST}" && sha256sum "$(basename "${DB_FILE}")" "$(basename "${UP_FILE}")" > "sha256-${TS}.txt" )

# 每月 1 號的備份另存為月備份
if [[ "$(date +%d)" == "01" ]]; then
  for f in "${DB_FILE}" "${UP_FILE}"; do cp "${f}" "${f/-${TS}/-monthly-${TS}}"; done
fi

# 清理：一般備份留 14 天、月備份留 365 天
find "${DEST}" -maxdepth 1 -type f \( -name 'db-2*' -o -name 'uploads-2*' -o -name 'sha256-2*' \) -mtime +14 -delete
find "${DEST}" -maxdepth 1 -type f -name '*-monthly-*' -mtime +365 -delete

if [[ -n "${OFFSITE_TARGET}" ]]; then
  rsync -a "${DB_FILE}" "${UP_FILE}" "${DEST}/sha256-${TS}.txt" "${OFFSITE_TARGET}"
  echo "  已複製到異地 ${OFFSITE_TARGET}"
fi

echo "[$(date '+%F %T')] 完成：$(du -h "${DB_FILE}" | cut -f1) 資料庫、$(du -h "${UP_FILE}" | cut -f1) 上傳檔"
