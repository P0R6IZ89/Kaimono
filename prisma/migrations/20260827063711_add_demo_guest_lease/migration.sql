/*
  Warnings:

  - Made the column `authorId` on table `PlannedComment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PlannedComment" ALTER COLUMN "authorId" SET NOT NULL;

-- CreateTable
CREATE TABLE "DemoLease" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoLease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DemoLease_userId_key" ON "DemoLease"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DemoLease_appId_key" ON "DemoLease"("appId");

-- CreateIndex
CREATE INDEX "DemoLease_expiresAt_idx" ON "DemoLease"("expiresAt");

-- AddForeignKey
ALTER TABLE "DemoLease" ADD CONSTRAINT "DemoLease_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoLease" ADD CONSTRAINT "DemoLease_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
