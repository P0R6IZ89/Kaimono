/*
  Warnings:

  - You are about to drop the `Planned` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Essentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Essentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Essentials" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Planned";

-- CreateTable
CREATE TABLE "Planneds" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(65,30),
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Planneds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discards" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscardTags" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "DiscardTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DiscardTagsToDiscards" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DiscardTagsToDiscards_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Planneds_userId_key" ON "Planneds"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscardTags_title_key" ON "DiscardTags"("title");

-- CreateIndex
CREATE INDEX "_DiscardTagsToDiscards_B_index" ON "_DiscardTagsToDiscards"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Essentials_userId_key" ON "Essentials"("userId");

-- AddForeignKey
ALTER TABLE "Essentials" ADD CONSTRAINT "Essentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planneds" ADD CONSTRAINT "Planneds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscardTagsToDiscards" ADD CONSTRAINT "_DiscardTagsToDiscards_A_fkey" FOREIGN KEY ("A") REFERENCES "DiscardTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscardTagsToDiscards" ADD CONSTRAINT "_DiscardTagsToDiscards_B_fkey" FOREIGN KEY ("B") REFERENCES "Discards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
