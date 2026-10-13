#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-server.sh — 新主機第一次安裝（只需執行一次）
# 適用：Ubuntu Server 24.04 LTS（22.04 也可，但標準支援到 2027/04，不建議）
#
# 用法：sudo bash deploy/ubuntu/scripts/setup-server.sh
#
# 會做的事：
#   1. 安裝 Node.js 22 LTS（NodeSource 官方套件庫）、PostgreSQL 16、Nginx、rsync
#   2. 建立系統帳號 eerc 與目錄 /srv/eerc/{releases,shared,uploads,backups}
#   3. 建立資料庫 eerc 與同名帳號（密碼隨機產生，只顯示一次）
#   4. 防火牆只開 22/80/443
#
# 不會做的事（需人工處理）：TLS 憑證放置、.env 填寫、資料匯入、第一次部署
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

NODE_MAJOR="${NODE_MAJOR:-22}"
# PostgreSQL 主版本：留空＝用 Ubuntu 內建（24.04 是 16）。
# ⚠️ 若 Neon 上的資料庫是 17 版（先在 Neon 執行 SELECT version(); 確認），請改用：
#      sudo PG_MAJOR=17 bash setup-server.sh
#    主機版本不可低於 Neon，否則 pg_dump／pg_restore 會出現版本不符錯誤。
PG_MAJOR="${PG_MAJOR:-}"
APP_USER="eerc"
BASE="/srv/eerc"
DB_NAME="eerc"
DB_USER="eerc"

if [[ $EUID -ne 0 ]]; then
  echo "請用 sudo 執行" >&2
  exit 1
fi

. /etc/os-release
echo "▶ 作業系統：${PRETTY_NAME}"
if [[ "${ID}" != "ubuntu" ]]; then
  echo "⚠ 這支腳本只在 Ubuntu 上測試過，其他發行版請人工安裝" >&2
  exit 1
fi

echo "▶ [1/4] 安裝套件"
apt-get update
apt-get install -y ca-certificates curl gnupg rsync nginx ufw openssl
if [[ -z "${PG_MAJOR}" ]]; then
  apt-get install -y postgresql postgresql-contrib
else
  # PostgreSQL 官方套件庫（PGDG）
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor --yes -o /etc/apt/keyrings/postgresql.gpg
  echo "deb [signed-by=/etc/apt/keyrings/postgresql.gpg] https://apt.postgresql.org/pub/repos/apt ${VERSION_CODENAME}-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update
  apt-get install -y "postgresql-${PG_MAJOR}" "postgresql-client-${PG_MAJOR}"
fi

if ! command -v node >/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" != "${NODE_MAJOR}" ]]; then
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update
  apt-get install -y nodejs
fi
# 確保服務開機自動啟動（容器等沒有 systemd 的環境略過）
if [[ -d /run/systemd/system ]]; then
  systemctl enable --now postgresql nginx
fi
echo "  node $(node -v)／npm $(npm -v)／$(psql --version)／$(nginx -v 2>&1)"

echo "▶ [2/4] 建立帳號與目錄"
if ! id "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir "${BASE}/home" --shell /usr/sbin/nologin "${APP_USER}"
fi
install -d -o "${APP_USER}" -g "${APP_USER}" -m 0755 "${BASE}" "${BASE}/releases" "${BASE}/uploads"
install -d -o root -g "${APP_USER}" -m 0750 "${BASE}/shared"
install -d -o root -g root -m 0700 "${BASE}/backups"

echo "▶ [3/4] 建立資料庫"
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  echo "  資料庫帳號 ${DB_USER} 已存在，略過（不會更改既有密碼）"
else
  DB_PASS="$(openssl rand -hex 24)"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}'"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER} ENCODING 'UTF8' TEMPLATE template0"
  echo
  echo "  ┌───────────────────────────────────────────────────────────────┐"
  echo "  │ 資料庫密碼只顯示這一次，請立刻填進 ${BASE}/shared/.env 的 DATABASE_URL │"
  echo "  └───────────────────────────────────────────────────────────────┘"
  echo "  DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}?schema=public\""
  echo
fi

echo "▶ [4/4] 防火牆"
# ⚠️ SSH 若不是 22 埠，請先設 SSH_PORT，否則啟用防火牆後會把自己鎖在外面：
#      sudo SSH_PORT=2222 bash setup-server.sh
#    教網中心若已有網路層防火牆、不希望主機再開 ufw，可設 SKIP_UFW=1 略過。
SSH_PORT="${SSH_PORT:-22}"
if [[ "${SKIP_UFW:-0}" == "1" ]]; then
  echo "  已略過（SKIP_UFW=1）"
else
  ufw allow "${SSH_PORT}/tcp" >/dev/null
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
  if ufw --force enable >/dev/null 2>&1; then
    ufw status | sed 's/^/  /'
  else
    echo "  ⚠ 無法啟用 ufw（可能是容器環境或權限不足），請人工確認防火牆只開 ${SSH_PORT}/80/443"
  fi
fi

cat <<EOF

✅ 安裝完成。接下來（詳見 deploy/ubuntu/README-部署說明.md）：
  1. 填寫 ${BASE}/shared/.env（範本：deploy/ubuntu/env.production.example）
  2. 匯入資料庫（restore-db.sh）
  3. 放置 TLS 憑證並安裝 Nginx 設定
  4. 第一次部署：sudo bash deploy/ubuntu/scripts/deploy.sh
EOF
