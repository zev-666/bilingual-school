# 基隆市英語資源中心網站 — Ubuntu 主機部署說明

> 對象：委外維運廠商、教育網路中心承辦人、本中心承辦人
> 適用：Ubuntu Server 24.04 LTS（教育網路中心配發之 VM）
> 本資料夾內的腳本與設定檔已於 Ubuntu 24.04.4 實機測試（安裝、部署、自動回滾、Nginx、上傳、備份還原），測試紀錄見文末。

---

## 一、架構

```
使用者瀏覽器
   │ HTTPS 443
   ▼
Nginx 1.24 ──┬── /uploads/…  → 直接讀 /srv/eerc/uploads（上傳檔、搬遷檔）
             └── 其他       → 127.0.0.1:3000  Next.js 15（systemd 服務 eerc-web）
                                     │
                                     ▼
                              PostgreSQL 16（本機 127.0.0.1:5432）
```

| 元件 | 版本 | 備註 |
|---|---|---|
| 作業系統 | Ubuntu Server 24.04 LTS | 標準支援至 2029/04；22.04 支援到 2027/04，會落在合約期間內，不建議 |
| Node.js | 22 LTS | 支援至 2027/04；屆時改用 24 LTS（`NODE_MAJOR=24` 重跑 setup-server.sh） |
| 網站框架 | Next.js 15.5、React 19 | |
| 資料庫 | PostgreSQL 16（Ubuntu 內建） | 若 Neon 上是 17 版，主機也要裝 17，見第四節 |
| 網頁伺服器 | Nginx 1.24（Ubuntu 內建） | |

### 目錄配置

```
/srv/eerc/
├── current -> releases/20261013-014456   目前上線的版本（捷徑）
├── releases/                              每次部署一個資料夾，保留最近 5 個
├── uploads/                               上傳檔＋搬遷檔（不隨版本更換，務必備份）
├── shared/.env                            環境設定（含密碼，權限 640）
├── backups/                               每日備份（權限 700）
└── deploy-history.log                     部署紀錄
```

### 建議主機規格

| 項目 | 建議 |
|---|---|
| CPU／記憶體 | 2 vCPU／4 GB（建置時 Node 會用到約 2 GB） |
| 磁碟 | 40 GB 以上（目前上傳檔約 400 MB，每日備份約 400 MB × 14 份） |
| 對外連線（主機端） | 部署時需連：`github.com`、`registry.npmjs.org`、`binaries.prisma.sh`、`deb.nodesource.com`、Ubuntu 套件庫 |
| 對外連線（使用者瀏覽器） | 網頁會載入 Google Fonts、YouTube 影片與縮圖、Google 地圖；主機本身不需要連這些 |

---

## 二、安裝流程總覽

| 步驟 | 做什麼 | 誰做 | 指令／檔案 |
|---|---|---|---|
| 1 | 安裝套件、建帳號與資料庫 | 廠商 | `setup-server.sh` |
| 2 | 填寫環境設定 | 廠商＋本中心（提供金鑰） | `env.production.example` → `/srv/eerc/shared/.env` |
| 3 | 從 Neon 匯出資料庫並匯入 | 廠商 | `restore-db.sh` |
| 4 | 放 TLS 憑證、裝 Nginx 設定 | 廠商＋教網中心（憑證） | `nginx/eerc.conf` |
| 5 | 裝 systemd 服務 | 廠商 | `systemd/eerc-web.service` |
| 6 | 第一次部署 | 廠商 | `deploy.sh` |
| 7 | 把 Vercel Blob 上的圖片搬回本機 | 廠商 | `migrate-blob-to-local.mjs` |
| 8 | 設定每日備份 | 廠商 | `backup.sh` |
| 9 | 驗收、弱點掃描、DNS 切換 | 教網中心＋廠商＋本中心 | 第九節 |

---

## 三、步驟 1：主機初始化

```bash
git clone https://github.com/zev-666/bilingual-school.git /tmp/eerc-src
sudo bash /tmp/eerc-src/deploy/ubuntu/scripts/setup-server.sh
```

可選參數（放在 `sudo` 後面）：

| 參數 | 用途 |
|---|---|
| `PG_MAJOR=17` | Neon 是 17 版時，改裝 PostgreSQL 17 |
| `SSH_PORT=2222` | SSH 不是 22 埠時必填，否則啟用防火牆會把自己鎖在外面 |
| `SKIP_UFW=1` | 教網中心已有網路層防火牆、不需要主機防火牆時 |

⚠️ 腳本最後會**顯示一次**資料庫密碼（`DATABASE_URL=...`），請立刻抄進步驟 2 的 `.env`。

---

## 四、步驟 2：環境設定

```bash
sudo cp /tmp/eerc-src/deploy/ubuntu/env.production.example /srv/eerc/shared/.env
sudo chown root:eerc /srv/eerc/shared/.env
sudo chmod 640 /srv/eerc/shared/.env
sudo nano /srv/eerc/shared/.env
```

| 變數 | 必填 | 說明 |
|---|---|---|
| `DATABASE_URL` | ✅ | 步驟 1 顯示的那一行 |
| `JWT_SECRET` | ✅ | `openssl rand -base64 48` 產生。**少於 32 字元網站會刻意拒絕啟動** |
| `UPLOAD_DIR` | ✅ | 固定 `/srv/eerc/uploads` |
| `PUBLIC_ORIGIN` | ✅ | `https://englishcenter.kl.edu.tw`。沒設的話轉址會跑到 `localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | 同上 |
| `SMTP_*`、`CONTACT_NOTIFY_EMAIL` | 選填 | 聯絡表單 Email 通知 |
| `BLOB_READ_WRITE_TOKEN`、`AWS_*` | ❌ **不可設定** | 設了上傳檔會被傳到外部雲端；`deploy.sh` 偵測到會拒絕部署 |

🔒 填好的 `.env` 不可 commit、不可寄信、不可截圖。

---

## 五、步驟 3：資料庫搬遷（Neon → 本機）

**先確認 Neon 的版本**：在 Neon 主控台的 SQL Editor 執行 `SELECT version();`。主機的 PostgreSQL 版本**不可低於** Neon，否則匯出會出現版本不符的錯誤（需要時用 `PG_MAJOR=17` 重跑步驟 1）。

```bash
# 匯出（主機能連到 Neon 時）
sudo bash /tmp/eerc-src/deploy/ubuntu/scripts/restore-db.sh export "postgresql://…neon.tech/neondb?sslmode=require"

# 匯入（會清空本機資料庫，需輸入 YES 確認）
sudo bash /tmp/eerc-src/deploy/ubuntu/scripts/restore-db.sh import /srv/eerc/backups/neon-XXXXXXXX-XXXXXX.dump
```

匯入後會列出各資料表筆數，請和 Neon 核對（參考：公告 10、文件 177、相簿 65、照片 709、影片 26、團隊 14，以搬遷當下為準）。

> ⚠️ **不可以在空的資料庫上用 `prisma migrate deploy` 從頭建立資料表。**
> 本專案早期的 migration 紀錄與實際資料表命名有落差，從頭重播會建出錯誤的結構。
> 一定要從 Neon 匯入完整備份。`deploy.sh` 偵測到空資料庫會直接拒絕部署。

---

## 六、步驟 4～6：Nginx、服務、第一次部署

```bash
S=/tmp/eerc-src/deploy/ubuntu

# TLS 憑證（教網中心提供的全網域憑證；檔名依實際情況調整 eerc.conf 的 ★2）
sudo install -d -m 700 /etc/ssl/eerc
sudo cp fullchain.pem /etc/ssl/eerc/ && sudo cp privkey.pem /etc/ssl/eerc/
sudo chmod 600 /etc/ssl/eerc/privkey.pem

# Nginx
sudo cp $S/nginx/eerc.conf /etc/nginx/sites-available/eerc.conf
sudo cp $S/nginx/eerc-proxy.conf /etc/nginx/snippets/eerc-proxy.conf
sudo ln -sf /etc/nginx/sites-available/eerc.conf /etc/nginx/sites-enabled/eerc.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# systemd 服務（先確認 `which node` 是 /usr/bin/node）
sudo cp $S/systemd/eerc-web.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable eerc-web

# 第一次部署
sudo bash $S/scripts/deploy.sh
```

`deploy.sh` 成功會顯示 `✅ 部署完成：<時間>（commit xxxxxxx）`。

---

## 七、步驟 7：Vercel Blob 圖片搬回本機

後台過去上傳的圖片存在 Vercel Blob（網址 `*.public.blob.vercel-storage.com`）。搬家後要下載回本機並改寫資料庫網址：

```bash
cd /srv/eerc/current
sudo -u eerc bash -c 'set -a; . /srv/eerc/shared/.env; set +a; node deploy/ubuntu/scripts/migrate-blob-to-local.mjs'          # 預演
sudo -u eerc bash -c 'set -a; . /srv/eerc/shared/.env; set +a; node deploy/ubuntu/scripts/migrate-blob-to-local.mjs --write'  # 執行
```

（`/srv/eerc/shared/.env` 權限是 root:eerc 640，eerc 帳號可以讀取。）

- 全部下載成功才會改資料庫，任何一個失敗就整批中止
- 可安全重跑（已下載的不會重複下載）
- 最後會檢查資料庫是否還有 Blob 網址
- ⚠️ **網站上所有圖片確認正常之後**，才可以到 Vercel 停用 Blob Store

---

## 八、日常維運

### 更新網站

```bash
sudo bash /srv/eerc/current/deploy/ubuntu/scripts/deploy.sh            # 部署 master 最新版
sudo bash /srv/eerc/current/deploy/ubuntu/scripts/deploy.sh v2026.11   # 部署指定 tag
```

任何一步失敗，舊版本都會繼續服務；新版本啟動後若健康檢查失敗，**會自動切回上一版**。

### 手動切回上一版

```bash
ls /srv/eerc/releases                                         # 找上一版的資料夾名稱
sudo ln -sfn /srv/eerc/releases/<上一版> /srv/eerc/current
sudo systemctl restart eerc-web
```

### 備份

```bash
sudo cp /srv/eerc/current/deploy/ubuntu/scripts/backup.sh /usr/local/sbin/eerc-backup
sudo chmod 700 /usr/local/sbin/eerc-backup
echo '30 2 * * * root /usr/local/sbin/eerc-backup >> /var/log/eerc-backup.log 2>&1' | sudo tee /etc/cron.d/eerc-backup
```

- 每日備份資料庫與上傳檔，保留 14 天；每月 1 號的備份另存，保留 12 個月
- **同一台主機上的備份不算真正的備份**。請依合約設定異地複製：在 cron 那行加上 `OFFSITE_TARGET=帳號@主機:/路徑/`
- 還原演練（每年至少一次）：用 `restore-db.sh import` 匯入到測試資料庫

### 常用指令

| 用途 | 指令 |
|---|---|
| 服務狀態 | `sudo systemctl status eerc-web` |
| 即時紀錄 | `sudo journalctl -u eerc-web -f` |
| Nginx 錯誤紀錄 | `sudo tail -f /var/log/nginx/eerc.error.log` |
| 部署紀錄 | `cat /srv/eerc/deploy-history.log` |
| 資料庫狀態 | `cd /srv/eerc/current && sudo -u eerc bash -c 'set -a; . /srv/eerc/shared/.env; set +a; npx prisma migrate status'` |

---

## 九、上線前驗收清單

- [ ] `https://englishcenter.kl.edu.tw/zh-TW` 正常顯示，HTTP 自動轉 HTTPS
- [ ] 進首頁、進後台的轉址網址是正式網域，不是 `localhost:3000`
- [ ] 公告、文件、相簿、影片、團隊各頁筆數與舊站一致
- [ ] 文件下載（PDF／DOCX）、相簿照片、教材影片都能開
- [ ] 後台登入、新增公告、上傳圖片正常；**重新部署一次後**，剛剛上傳的圖片仍然看得到
- [ ] 🔒 **管理員密碼已不是 `Admin@1234`**（這組預設密碼公開在 GitHub 的 `prisma/seed.ts`）
- [ ] 🔒 正式主機**從未執行** `npm run db:seed`（會建立上述預設帳號）
- [ ] securityheaders.com 評等 A、SSL Labs 評等 A 以上
- [ ] 教網中心弱點掃描完成，發現的問題已修補
- [ ] 每日備份已排程，並完成一次還原演練
- [ ] DNS 切換到新主機

---

## 十、絕對不要做的事

| 不要做 | 原因 |
|---|---|
| 在正式資料庫執行 `prisma migrate dev`、`prisma migrate reset`、`prisma db push` | 會要求清空資料庫（migration 歷史有世代落差） |
| 在正式主機執行 `npm run db:seed` | 會建立公開在 GitHub 上的預設管理員帳號密碼 |
| 在 `.env` 設 `BLOB_READ_WRITE_TOKEN` 或 `AWS_*` | 上傳檔會被傳到外部雲端 |
| 刪除 `/srv/eerc/uploads` 或對它做 `rsync --delete` | 後台上傳的檔案只存在這裡 |
| 把 `.env`、憑證私鑰、資料庫備份放進 git 或寄信 | 外洩風險 |
| 讓 3000 埠對外開放 | 網站程式只應透過 Nginx 存取 |

---

## 附錄：測試紀錄（2026/10/13，Ubuntu 24.04.4 LTS）

| 項目 | 結果 |
|---|---|
| `shellcheck -S warning` 全部腳本 | 0 警告 |
| `setup-server.sh` 實際執行 | 套件安裝、帳號與目錄、資料庫建立、防火牆 22/80/443 皆成功 |
| `deploy.sh` 空資料庫 | 正確拒絕部署 |
| `deploy.sh` 正常部署 | clone → npm ci → build → 同步 397 MB 搬遷檔 → 切換 → 健康檢查 200 |
| `deploy.sh` 健康檢查失敗 | 自動切回上一版，網站持續回應 200 |
| `nginx -t` | 通過 |
| HTTPS／HTTP/2／HTTP 轉 HTTPS | 正常；TLS 1.1 被拒絕 |
| 安全標頭 | CSP、HSTS、X-Frame-Options、X-Content-Type-Options、Referrer-Policy、Permissions-Policy、COOP、CORP 皆輸出 |
| `/uploads/` PDF、照片、MP4（Range 206） | 正常 |
| 探測路徑 `/.env`、`/.git/config`、`/wp-login.php`、`/uploads/x.html`、路徑穿越 | 404／403 |
| 登入 API 限流 | 第 7 次起回 429 |
| 後台上傳 | 檔案寫入 `/srv/eerc/uploads`、經 Nginx 可讀、重新部署後仍存在；偽裝成圖片的 .html 會被存成 .png |
| 未登入進後台 | 307 轉到 `https://englishcenter.kl.edu.tw/admin/login` |
| `systemd-analyze verify`／`security` | 通過／曝險等級 4.6 OK |
| `backup.sh`、`restore-db.sh` export／import | 成功，筆數一致 |
| 前台 11 頁＋後台登入頁 axe-core（WCAG 2.2 AA） | 0 違規 |

測試環境限制：沙盒無法下載 Prisma 資料庫引擎，因此**未在有真實資料的情況下測試**。第一次在正式主機部署時，請逐步執行並核對每一步的輸出。
