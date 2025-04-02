/*
  Warnings:

  - You are about to drop the column `quantity` on the `Planned` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Essentials" ALTER COLUMN "quantity" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Planned" DROP COLUMN "quantity",
ADD COLUMN     "comment" TEXT,
ALTER COLUMN "price" DROP NOT NULL;
