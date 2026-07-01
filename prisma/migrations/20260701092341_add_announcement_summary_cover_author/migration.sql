-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "summaryEn" TEXT,
ADD COLUMN     "summaryZh" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
