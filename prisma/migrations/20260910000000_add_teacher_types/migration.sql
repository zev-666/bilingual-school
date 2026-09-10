-- 新增 TeacherType enum 值：CONVENER（召集人）與 LOCAL_ADVISOR（中籍顧問教師）
-- 用於「團隊介紹」頁的分組顯示；既有 FULL_TIME / PART_TIME / STAFF / FOREIGN 保留不動
--
-- 註：此變更已由 `npx prisma db push` 套用於資料庫，
-- 故不需重複執行 SQL；此檔僅補 migration 歷史紀錄，
-- 並以 `npx prisma migrate resolve --applied 20260910000000_add_teacher_types` 標記為已套用。

-- AlterEnum
ALTER TYPE "TeacherType" ADD VALUE 'CONVENER';
ALTER TYPE "TeacherType" ADD VALUE 'LOCAL_ADVISOR';