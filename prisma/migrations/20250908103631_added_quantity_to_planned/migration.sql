/*
  Warnings:

  - Made the column `price` on table `Planned` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Essential" DROP CONSTRAINT "Essential_appId_fkey";

-- DropForeignKey
ALTER TABLE "Planned" DROP CONSTRAINT "Planned_appId_fkey";

-- DropForeignKey
ALTER TABLE "PlannedComment" DROP CONSTRAINT "PlannedComment_plannedId_fkey";

-- DropForeignKey
ALTER TABLE "PlannedLike" DROP CONSTRAINT "PlannedLike_plannedId_fkey";

-- AlterTable
ALTER TABLE "Planned" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "image" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Essential" ADD CONSTRAINT "Essential_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planned" ADD CONSTRAINT "Planned_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedComment" ADD CONSTRAINT "PlannedComment_plannedId_fkey" FOREIGN KEY ("plannedId") REFERENCES "Planned"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedLike" ADD CONSTRAINT "PlannedLike_plannedId_fkey" FOREIGN KEY ("plannedId") REFERENCES "Planned"("id") ON DELETE CASCADE ON UPDATE CASCADE;
