-- 新增 documents.publishedAt 欄位（可空、無 default）
-- 用於文件發布日期：搬遷資料用真實/檔案修改時間（推測日期），後台上傳可選填
--
-- 註：此變更已由 `npx prisma db push` 套用於資料庫（DFS 驗證 DB↔schema 無 drift），
-- 故不需重複執行 SQL；此檔僅補 migration 歷史紀錄，
-- 並以 `npx prisma migrate resolve --applied 20260907000000_add_document_published_at` 標記為已套用。

ALTER TABLE "documents" ADD COLUMN "publishedAt" TIMESTAMP(3);