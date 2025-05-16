/*
  Warnings:

  - A unique constraint covering the columns `[subdomain]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customDomain]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "subdomain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Team_subdomain_key" ON "Team"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Team_customDomain_key" ON "Team"("customDomain");
