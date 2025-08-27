-- DropForeignKey
ALTER TABLE "Essential" DROP CONSTRAINT "Essential_appId_fkey";

-- DropForeignKey
ALTER TABLE "Planned" DROP CONSTRAINT "Planned_appId_fkey";

-- AddForeignKey
ALTER TABLE "Essential" ADD CONSTRAINT "Essential_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planned" ADD CONSTRAINT "Planned_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
