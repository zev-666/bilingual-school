-- 新增 AlbumCategory enum 與相簿/照片欄位（Phase 3 相簿搬遷）
-- albums.category    AlbumCategory NOT NULL DEFAULT 'OTHER'（舊站分類映射：教師研習活動→WORKSHOP、會議→MEETING、外師訪視→VISIT、活動照片→ACTIVITY、其他→OTHER）
-- albums.publishedAt TIMESTAMP(3) 可空（搬遷資料用舊站真實發布時間）
-- photos.fileSize    INTEGER 可空（bytes，從鏡像實際檔案讀取）
-- photos.isCover     BOOLEAN NOT NULL DEFAULT false（每本相簿第一張為封面）
--
-- 註：此變更已由 `npx prisma db push` 套用於資料庫（65 Album / 709 Photo 已寫入並驗證），
-- 故不需重複執行 SQL；此檔僅補 migration 歷史紀錄，
-- 並以 `npx prisma migrate resolve --applied 20260908000000_add_album_category_and_photo_fields` 標記為已套用。

-- CreateEnum
CREATE TYPE "AlbumCategory" AS ENUM ('WORKSHOP', 'MEETING', 'VISIT', 'ACTIVITY', 'OTHER');

-- AlterTable
ALTER TABLE "albums" ADD COLUMN     "category" "AlbumCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "photos" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "isCover" BOOLEAN NOT NULL DEFAULT false;
