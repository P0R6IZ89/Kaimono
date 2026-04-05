-- Add the missing relation column used by the current Prisma schema.
ALTER TABLE "Planned"
ADD COLUMN "projectAppId" TEXT;

-- Backfill the composite relation column from existing project links.
UPDATE "Planned" AS p
SET "projectAppId" = pr."appId"
FROM "Project" AS pr
WHERE p."projectId" = pr."id"
  AND p."projectId" IS NOT NULL;

-- Fail loudly instead of inventing app ownership for existing projects.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Project"
    WHERE "appId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot align Project relation: found Project rows with NULL appId';
  END IF;
END $$;

ALTER TABLE "Project"
ALTER COLUMN "appId" SET NOT NULL;

ALTER TABLE "Project"
DROP CONSTRAINT IF EXISTS "Project_appId_fkey";

ALTER TABLE "Project"
ADD CONSTRAINT "Project_appId_fkey"
FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Project"
ADD CONSTRAINT "Project_id_appId_key" UNIQUE ("id", "appId");

ALTER TABLE "Planned"
DROP CONSTRAINT IF EXISTS "Planned_projectId_fkey";

ALTER TABLE "Planned"
ADD CONSTRAINT "Planned_projectId_projectAppId_fkey"
FOREIGN KEY ("projectId", "projectAppId") REFERENCES "Project"("id", "appId") ON DELETE SET NULL ON UPDATE CASCADE;

DROP INDEX IF EXISTS "Planned_appId_projectId_idx";

CREATE INDEX "Planned_projectId_projectAppId_idx"
ON "Planned"("projectId", "projectAppId");
