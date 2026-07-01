/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `Teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "photoUrl",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "email" TEXT;
