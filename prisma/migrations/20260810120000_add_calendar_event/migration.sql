-- add-calendar-event-table.sql
-- 新增行事曆功能：CalendarEventType enum + calendar_events 資料表
-- 依 handoff-summary.md 的既有作法，用 `npx prisma db execute --file` 直接執行，
-- 繞開 migration 歷史世代對不上導致的 drift/reset 警告。

CREATE TYPE "CalendarEventType" AS ENUM ('HOLIDAY', 'MEETING', 'WORKSHOP', 'DEADLINE', 'ACTIVITY', 'OTHER');

CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "titleZh" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descZh" TEXT,
    "descEn" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "type" "CalendarEventType" NOT NULL DEFAULT 'OTHER',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);
