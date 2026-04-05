/*
  Warnings:

  - Made the column `image` on table `Planned` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PlannedLike" DROP CONSTRAINT "PlannedLike_creatorId_fkey";

-- AlterTable
ALTER TABLE "Planned" ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "image" SET DEFAULT 'https://res.cloudinary.com/dsttcre2h/image/upload/v1751870559/placeholder_dtzhrr.png';

-- AddForeignKey
ALTER TABLE "PlannedLike" ADD CONSTRAINT "PlannedLike_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
