/*
  Warnings:

  - Made the column `price` on table `Planned` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Planned" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "image" DROP NOT NULL;
