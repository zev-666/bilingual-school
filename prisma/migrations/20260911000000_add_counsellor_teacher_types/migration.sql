-- 新增 TeacherType enum 值：外籍／中籍英語教學輔導員
--
-- 背景：團隊分組由 4 組細分為 6 組（召集人／外籍顧問／外籍輔導員／中籍顧問／
-- 中籍輔導員／行政團隊）。原有 FOREIGN、LOCAL_ADVISOR 語意收斂為「顧問」，
-- 另新增兩個「輔導員」值。FULL_TIME／PART_TIME 維持保留不刪，避免破壞既有資料。
--
-- 註：此變更以 `npx prisma db push` 套用於資料庫，此檔僅補 migration 歷史紀錄，
-- 並以 `npx prisma migrate resolve --applied 20260911000000_add_counsellor_teacher_types`
-- 標記為已套用。
--
-- ⚠️ PostgreSQL 11 以前不支援在單一 migration 內新增多個 enum 值
-- （與第十二部分 v26 記錄的 20260910000000_add_teacher_types 同一風險）。
-- 未來若部署至舊版 PG 的政府 VM，從零重播 migration 時需拆成兩個檔案。

-- AlterEnum
ALTER TYPE "TeacherType" ADD VALUE 'FOREIGN_COUNSELLOR';

-- AlterEnum
ALTER TYPE "TeacherType" ADD VALUE 'LOCAL_COUNSELLOR';
