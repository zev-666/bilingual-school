# 舊網站搬遷進度記錄

來源：https://englishcenter.kl.edu.tw/（HTTrack 鏡像，2026-09-04 抓取，622 檔案 / 370MB）
目標：bilingual-school (Next.js + Prisma + PostgreSQL)

## 已完成
- [x] HTTrack 完整鏡像舊網站，存於 migration-source/englishcenter.kl.edu.tw/
- [x] 分析 Prisma schema，對應舊網站 5 類內容到現有模型
      (Announcement / Document / Album+Photo / Video；Books 無對應模型，暫緩)
- [x] 建立 migration-bot 使用者，作為搬遷內容的 authorId
- [x] Phase 1：最新消息 (Announcement) — 10 筆全部完成並寫入資料庫
      - 腳本：scripts/migrate-news.mjs
      - 附件已複製到 public/uploads/announcements/[news-id]/
      - 已驗證：總筆數、內容格式、authorId 皆正確
      - 技術債：news-49、news-50 內文中的內部連結（原本指向 220.html、221.html）
        暫時改寫成絕對網址指回舊網站，之後全部內容搬完後要改成指向新網站對應頁面

## ⚠️ 重要發現（待處理）— docs 鏡像資料不完整
- docs/file/ 底下實際有 **54 個文件子資料夾**（54 份真實文件），
  但 HTTrack 只抓到 **10 個**文件詳情頁 HTML
- 原因：docs.html 列表頁是動態 JS 打 API（bootstrap-table）產生，
  HTTrack 靜態爬蟲抓不到，另外 44 筆沒有 metadata（標題/分類/描述）可用
- 下次要先決定：44 筆用檔名代替標題？回頭補抓 API？還是先跳過只處理有資料的 10 筆？
- 相簿(photo)、影音(video) 是否也有同樣問題，Phase 3/4 開始前要先做同樣的數量核對
  （比對 xxx/file/ 資料夾數量 vs xxx/*.html 詳情頁數量）

## 待決定事項（尚未解決）
- Announcement 表裡有 4 筆「非本次搬遷」的既有資料：
  welcome-2024、admission-2025、115-activity-xxx、0824研習活動-xxx
  （authorId 不是 migration-bot，建立時間早於今天）
  → 已請 Cline 印出完整內容待審查，**因 Cline 每日免費額度用完而中斷，
    尚未看到內容，下次繼續**

## 目前卡住原因
- Cline 免費額度今日用完（提示 23h47m 後重置，或換一個 model 繼續）

## 待辦（依序，下次開機接續）
- [ ] 先看那 4 筆既有公告的內容，決定留或刪
- [ ] 決定 docs 資料缺口 44 筆的處理方式（見上）
- [ ] Phase 2：文件 (Document) — 待缺口問題解決後才動手
- [ ] Phase 3：相簿 (Album + Photo) — 開始前先核對 photo/file 資料夾數 vs photo/*.html 數
- [ ] Phase 4：影音 (Video) — 開始前先核對 video/file 資料夾數 vs video/*.html 數
- [ ] （暫緩）線上教材 (Books) — 目前 Prisma 無對應模型，需先建模再搬

## 技術債：影音內容依賴外部網路（2026-09-08 記錄）
- Phase 4 搬遷的 26 筆影音全部是 YouTube embed（縮圖 `img.youtube.com` + 播放 `youtube.com/embed`），
  舊站源頭就沒有影片檔案，只有嵌入連結
- 若最終部署環境是**無對外網路的政府 ISO 封包**，26 支影片會「縮圖破圖且無法播放」
  （內容本體在 YouTube，本地沒有備份）
- 待 VM/ISO 部署方向確定後再決定因應方式（例如：下載影片改本地託管、
  或接受此限制只保留有網路時可看）；**現在先不改動架構**
- 同性質注意事項：相簿/公告/文件的圖片與附件已是本地檔案（public/uploads/**），
  不受離線部署影響
## 技術債：AlbumsClient.tsx 為未被引用的死代碼（2026-09-10 記錄）
- `src/app/[locale]/albums/AlbumsClient.tsx` 目前**沒有被任何地方 import**（死代碼）
- 功能比 `page.tsx` 完整（含分頁/排序/篩選）但配色是舊版 indigo 漸層 header
- 前台相簿列表改用 `page.tsx`（Server Component，卡片已可點擊）
- 日後需決定：啟用 AlbumsClient.tsx（需含配色調整對齊新設計系統）或刪除
