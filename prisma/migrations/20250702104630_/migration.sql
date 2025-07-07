/*
  Warnings:

  - You are about to drop the `DiscardTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Discards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Essentials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Planneds` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AppUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DiscardTagsToDiscards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Essentials" DROP CONSTRAINT "Essentials_appId_fkey";

-- DropForeignKey
ALTER TABLE "Essentials" DROP CONSTRAINT "Essentials_userId_fkey";

-- DropForeignKey
ALTER TABLE "Planneds" DROP CONSTRAINT "Planneds_appId_fkey";

-- DropForeignKey
ALTER TABLE "Planneds" DROP CONSTRAINT "Planneds_userId_fkey";

-- DropForeignKey
ALTER TABLE "_AppUsers" DROP CONSTRAINT "_AppUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_AppUsers" DROP CONSTRAINT "_AppUsers_B_fkey";

-- DropForeignKey
ALTER TABLE "_DiscardTagsToDiscards" DROP CONSTRAINT "_DiscardTagsToDiscards_A_fkey";

-- DropForeignKey
ALTER TABLE "_DiscardTagsToDiscards" DROP CONSTRAINT "_DiscardTagsToDiscards_B_fkey";

-- DropTable
DROP TABLE "DiscardTags";

-- DropTable
DROP TABLE "Discards";

-- DropTable
DROP TABLE "Essentials";

-- DropTable
DROP TABLE "Planneds";

-- DropTable
DROP TABLE "_AppUsers";

-- DropTable
DROP TABLE "_DiscardTagsToDiscards";

-- CreateTable
CREATE TABLE "Essential" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Essential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Planned" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(65,30),
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Planned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssentialComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "essentialId" TEXT NOT NULL,

    CONSTRAINT "EssentialComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "plannedId" TEXT NOT NULL,

    CONSTRAINT "PlannedComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssentialLike" (
    "id" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "essentialId" TEXT NOT NULL,

    CONSTRAINT "EssentialLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedLike" (
    "id" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "plannedId" TEXT NOT NULL,

    CONSTRAINT "PlannedLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AppMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "EssentialLike_userId_essentialId_key" ON "EssentialLike"("userId", "essentialId");

-- CreateIndex
CREATE UNIQUE INDEX "PlannedLike_userId_plannedId_key" ON "PlannedLike"("userId", "plannedId");

-- CreateIndex
CREATE INDEX "_AppMembers_B_index" ON "_AppMembers"("B");

-- AddForeignKey
ALTER TABLE "Essential" ADD CONSTRAINT "Essential_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Essential" ADD CONSTRAINT "Essential_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planned" ADD CONSTRAINT "Planned_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planned" ADD CONSTRAINT "Planned_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssentialComment" ADD CONSTRAINT "EssentialComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssentialComment" ADD CONSTRAINT "EssentialComment_essentialId_fkey" FOREIGN KEY ("essentialId") REFERENCES "Essential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedComment" ADD CONSTRAINT "PlannedComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedComment" ADD CONSTRAINT "PlannedComment_plannedId_fkey" FOREIGN KEY ("plannedId") REFERENCES "Planned"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssentialLike" ADD CONSTRAINT "EssentialLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssentialLike" ADD CONSTRAINT "EssentialLike_essentialId_fkey" FOREIGN KEY ("essentialId") REFERENCES "Essential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedLike" ADD CONSTRAINT "PlannedLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedLike" ADD CONSTRAINT "PlannedLike_plannedId_fkey" FOREIGN KEY ("plannedId") REFERENCES "Planned"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppMembers" ADD CONSTRAINT "_AppMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppMembers" ADD CONSTRAINT "_AppMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
