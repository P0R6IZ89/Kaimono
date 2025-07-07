/*
  Warnings:

  - You are about to drop the column `userId` on the `PlannedLike` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[creatorId,plannedId]` on the table `PlannedLike` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorId` to the `PlannedLike` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlannedLike" DROP CONSTRAINT "PlannedLike_userId_fkey";

-- DropIndex
DROP INDEX "PlannedLike_userId_plannedId_key";

-- AlterTable
ALTER TABLE "PlannedLike" DROP COLUMN "userId",
ADD COLUMN     "creatorId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlannedLike_creatorId_plannedId_key" ON "PlannedLike"("creatorId", "plannedId");

-- AddForeignKey
ALTER TABLE "PlannedLike" ADD CONSTRAINT "PlannedLike_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
