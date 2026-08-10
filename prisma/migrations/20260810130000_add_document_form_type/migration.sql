-- 新增 DocumentFormType enum 與 documents.formType 欄位
-- 用於前台 /documents 頁面的「教學表單／行政表單」分頁功能
-- 沿用 Phase 1 / Phase 2 的 db execute 手動 SQL 做法，繞開 migration history drift 問題

CREATE TYPE "DocumentFormType" AS ENUM ('TEACHING', 'ADMINISTRATIVE');

ALTER TABLE "documents"
  ADD COLUMN "formType" "DocumentFormType" NOT NULL DEFAULT 'ADMINISTRATIVE';
