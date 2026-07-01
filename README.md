# 🏫 雙語實驗學校官網 | Bilingual School Website

世界級雙語學校官方網站，採用 Next.js 14 App Router 打造，支援繁體中文 / English 雙語切換。

![Tech Stack](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)

---

## 🚀 功能特色

### 前台（公開端）
- 🌐 **雙語支援** — zh-TW / English，URL 結構 `/zh-TW/...` 與 `/en/...`
- 🎠 **Hero 輪播** — 全螢幕橫幅、自動播放、鍵盤可存取
- 📊 **動態數字** — 統計數字滾動動畫（Intersection Observer）
- 📰 **最新消息** — 分類 / 搜尋 / 分頁，支援 Markdown 內文
- 📸 **活動相簿** — 網格佈局、Lightbox 預覽
- 🎬 **活動影音** — YouTube / Vimeo 嵌入縮圖
- 📄 **文件下載** — PDF 下載、下載次數統計
- 👨‍🏫 **師資介紹** — 依類型分組顯示
- 📬 **聯絡表單** — Zod 驗證、送出後顯示成功 / 錯誤狀態
- ♿ **無障礙** — ARIA 標籤、鍵盤導航、skip-to-content

### 後台（Admin Dashboard）
- 🔐 **JWT 認證** — HttpOnly Cookie、角色權限控制（SUPER_ADMIN / ADMIN / EDITOR / AUTHOR）
- 📋 **公告管理** — 雙語 CRUD、Markdown 編輯器、發布 / 草稿切換、置頂
- 🗂 **相簿管理** — 建立相簿、批次上傳照片
- 📨 **聯絡訊息** — 查看表單提交、一鍵回覆
- 📈 **儀表板** — 統計卡片、最新公告列表、快速操作

---

## 📁 目錄結構

```
bilingual-school/
├── prisma/
│   ├── schema.prisma        # 資料庫 Schema
│   └── seed.ts              # 初始資料 Seed
├── src/
│   ├── app/
│   │   ├── [locale]/        # 雙語路由 (zh-TW / en)
│   │   │   ├── page.tsx     # 首頁
│   │   │   ├── news/        # 最新消息
│   │   │   ├── albums/      # 相簿
│   │   │   ├── videos/      # 影音
│   │   │   ├── documents/   # 文件
│   │   │   ├── teachers/    # 師資
│   │   │   ├── about/       # 關於
│   │   │   ├── admission/   # 招生
│   │   │   └── contact/     # 聯絡
│   │   ├── admin/           # 後台管理
│   │   │   ├── login/       # 登入頁
│   │   │   ├── dashboard/   # 儀表板
│   │   │   ├── announcements/
│   │   │   ├── albums/
│   │   │   ├── contacts/
│   │   │   └── ...
│   │   └── api/             # API Routes
│   │       ├── announcements/
│   │       ├── albums/
│   │       ├── documents/
│   │       ├── teachers/
│   │       ├── contacts/
│   │       ├── upload/
│   │       └── auth/
│   ├── components/
│   │   ├── layout/          # Navbar, Footer
│   │   └── sections/        # Hero, Stats, News, About, QuickLinks
│   ├── i18n/
│   │   ├── messages/        # zh-TW.json, en.json
│   │   ├── routing.ts
│   │   └── request.ts
│   ├── lib/
│   │   ├── prisma.ts        # Prisma 單例
│   │   ├── auth.ts          # JWT / bcrypt 工具
│   │   └── utils.ts         # 通用工具函式
│   └── middleware.ts        # i18n + Admin 保護
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚙️ 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env.local
# 編輯 .env.local，填入 DATABASE_URL 及 JWT_SECRET
```

### 3. 建立資料庫

```bash
# 推送 Schema（開發用）
npx prisma db push

# 或建立並執行 migration
npx prisma migrate dev --name init
```

### 4. 填入初始資料

```bash
npm run db:seed
```

預設管理員帳號：
- 信箱：`admin@school.edu.tw`
- 密碼：`Admin@1234`

### 5. 啟動開發伺服器

```bash
npm run dev
```

開啟 http://localhost:3000

---

## 🌐 路由說明

| 路徑 | 說明 |
|------|------|
| `/zh-TW` | 中文首頁 |
| `/en` | English homepage |
| `/zh-TW/news` | 最新消息 |
| `/zh-TW/news/[slug]` | 公告詳情 |
| `/zh-TW/albums` | 活動相簿 |
| `/zh-TW/videos` | 活動影音 |
| `/zh-TW/documents` | 文件下載 |
| `/zh-TW/teachers` | 師資介紹 |
| `/zh-TW/contact` | 聯絡我們 |
| `/admin/login` | 後台登入 |
| `/admin/dashboard` | 管理儀表板 |

---

## 🔌 API Endpoints

| 方法 | 路徑 | 說明 | 權限 |
|------|------|------|------|
| GET | `/api/announcements` | 取得公告列表 | 公開 |
| POST | `/api/announcements` | 建立公告 | AUTHOR+ |
| GET | `/api/announcements/:slug` | 取得單一公告 | 公開 |
| PATCH | `/api/announcements/:slug` | 更新公告 | EDITOR+ |
| DELETE | `/api/announcements/:slug` | 刪除公告 | ADMIN+ |
| GET | `/api/albums` | 取得相簿列表 | 公開 |
| POST | `/api/albums` | 建立相簿 | EDITOR+ |
| GET | `/api/documents` | 取得文件列表 | 公開 |
| POST | `/api/documents` | 建立文件 | EDITOR+ |
| GET | `/api/teachers` | 取得師資列表 | 公開 |
| POST | `/api/teachers` | 建立師資 | ADMIN+ |
| POST | `/api/contacts` | 提交聯絡表單 | 公開 |
| GET | `/api/contacts` | 取得聯絡訊息 | EDITOR+ |
| POST | `/api/upload` | 上傳檔案 | EDITOR+ |
| POST | `/api/auth/login` | 登入 | 公開 |
| POST | `/api/auth/logout` | 登出 | 公開 |
| GET | `/api/auth/me` | 取得目前使用者 | 已登入 |

---

## 🚢 部署

### Vercel（推薦）

```bash
npm install -g vercel
vercel --prod
```

設定環境變數：
- `DATABASE_URL` — PostgreSQL（建議使用 Neon 或 Supabase）
- `JWT_SECRET` — 隨機 32 bytes hex

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
```

---

## 🔧 客製化

### 變更品牌色彩

編輯 `tailwind.config.ts`：

```ts
colors: {
  primary: {
    600: '#4F46E5', // 主色
    // ...
  }
}
```

### 新增語言

1. 在 `src/i18n/routing.ts` 的 `locales` 加入新語言
2. 在 `src/i18n/messages/` 新增對應的 JSON 翻譯檔

---

## 📝 開發注意事項

- **離線開發**：所有頁面包含 mock data fallback，不需要資料庫即可預覽
- **圖片優化**：使用 `next/image` 自動 WebP 轉換與 lazy loading
- **SEO**：每頁皆有 `generateMetadata` 動態產生 meta tags
- **a11y**：所有互動元件皆有 ARIA 標籤，支援鍵盤操作

---

## 📄 License

MIT © 雙語實驗學校
