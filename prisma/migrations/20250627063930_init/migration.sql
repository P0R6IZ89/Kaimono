/*
  Warnings:

  - You are about to drop the column `teamId` on the `Essentials` table. All the data in the column will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TeamToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `appId` to the `Essentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appId` to the `Planneds` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Essentials" DROP CONSTRAINT "Essentials_teamId_fkey";

-- DropForeignKey
ALTER TABLE "_TeamToUser" DROP CONSTRAINT "_TeamToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_TeamToUser" DROP CONSTRAINT "_TeamToUser_B_fkey";

-- AlterTable
ALTER TABLE "Essentials" DROP COLUMN "teamId",
ADD COLUMN     "appId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Planneds" ADD COLUMN     "appId" TEXT NOT NULL,
ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "_TeamToUser";

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subdomain" TEXT,
    "customDomain" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AppUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "App_subdomain_key" ON "App"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "App_customDomain_key" ON "App"("customDomain");

-- CreateIndex
CREATE INDEX "_AppUsers_B_index" ON "_AppUsers"("B");

-- AddForeignKey
ALTER TABLE "Essentials" ADD CONSTRAINT "Essentials_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planneds" ADD CONSTRAINT "Planneds_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppUsers" ADD CONSTRAINT "_AppUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppUsers" ADD CONSTRAINT "_AppUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
