/* Purpose: convert existing text columns to enums safely, adjust price precision,
   set e-mail to CITEXT, relax nullable creators, and add indexes. */

/* 0) Extensions */
CREATE EXTENSION IF NOT EXISTS citext;

/* 1) Create enum types only if missing */
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Status') THEN
    CREATE TYPE "Status" AS ENUM ('PENDING', 'PURCHASED', 'CANCELLED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Priority') THEN
    CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
  END IF;
END$$;

/* 2) Normalize existing data (avoid NULLs before conversion) */
UPDATE "Essential" SET "status" = COALESCE("status", 'pending');
UPDATE "Planned"   SET "status" = COALESCE("status", 'pending');
UPDATE "Planned"   SET "priority" = COALESCE("priority", 'medium');

/* 3) Drop defaults (harmless if none) so we can alter types */
ALTER TABLE "Essential" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Planned"   ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Planned"   ALTER COLUMN "priority" DROP DEFAULT;

/* 4) In-place type conversions with USING CASE (preserves data) */
ALTER TABLE "Essential"
  ALTER COLUMN "status" TYPE "Status"
  USING CASE
    WHEN "status" ILIKE 'pending'   THEN 'PENDING'::"Status"
    WHEN "status" ILIKE 'purchased' THEN 'PURCHASED'::"Status"
    WHEN "status" ILIKE 'cancelled' THEN 'CANCELLED'::"Status"
    WHEN "status" ILIKE 'canceled'  THEN 'CANCELLED'::"Status"
    ELSE 'PENDING'::"Status"
  END;

ALTER TABLE "Planned"
  ALTER COLUMN "status" TYPE "Status"
  USING CASE
    WHEN "status" ILIKE 'pending'   THEN 'PENDING'::"Status"
    WHEN "status" ILIKE 'purchased' THEN 'PURCHASED'::"Status"
    WHEN "status" ILIKE 'cancelled' THEN 'CANCELLED'::"Status"
    WHEN "status" ILIKE 'canceled'  THEN 'CANCELLED'::"Status"
    ELSE 'PENDING'::"Status"
  END;

ALTER TABLE "Planned"
  ALTER COLUMN "priority" TYPE "Priority"
  USING CASE
    WHEN "priority" ILIKE 'low'    THEN 'LOW'::"Priority"
    WHEN "priority" ILIKE 'medium' THEN 'MEDIUM'::"Priority"
    WHEN "priority" ILIKE 'high'   THEN 'HIGH'::"Priority"
    WHEN "priority" ILIKE 'urgent' THEN 'URGENT'::"Priority"
    ELSE 'MEDIUM'::"Priority"
  END;

/* 5) Restore constraints to match your Prisma schema */
ALTER TABLE "Essential"
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"Status",
  ALTER COLUMN "status" SET NOT NULL;

ALTER TABLE "Planned"
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"Status",
  ALTER COLUMN "status" SET NOT NULL;

ALTER TABLE "Planned"
  ALTER COLUMN "priority" SET NOT NULL;

/* 6) Price precision adjustments (Decimal(65,30) -> Decimal(12,2)) */
ALTER TABLE "Essential" ALTER COLUMN "price" TYPE DECIMAL(12,2);
ALTER TABLE "Planned"   ALTER COLUMN "price" TYPE DECIMAL(12,2);

/* 7) Email to CITEXT (idempotent if already CITEXT) */
ALTER TABLE "User"       ALTER COLUMN "email" TYPE CITEXT;
ALTER TABLE "Invitation" ALTER COLUMN "email" TYPE CITEXT;

/* 8) Make creator/authors nullable (to support ON DELETE SET NULL) */
ALTER TABLE "Essential"       ALTER COLUMN "creatorId" DROP NOT NULL;
ALTER TABLE "Planned"         ALTER COLUMN "creatorId" DROP NOT NULL;
ALTER TABLE "PlannedComment"  ALTER COLUMN "authorId"  DROP NOT NULL;

/* 9) Recreate FKs with ON DELETE SET NULL (if they currently differ) */
ALTER TABLE "Essential"      DROP CONSTRAINT IF EXISTS "Essential_creatorId_fkey";
ALTER TABLE "Planned"        DROP CONSTRAINT IF EXISTS "Planned_creatorId_fkey";
ALTER TABLE "PlannedComment" DROP CONSTRAINT IF EXISTS "PlannedComment_authorId_fkey";

ALTER TABLE "Essential"
  ADD CONSTRAINT "Essential_creatorId_fkey"
  FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Planned"
  ADD CONSTRAINT "Planned_creatorId_fkey"
  FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PlannedComment"
  ADD CONSTRAINT "PlannedComment_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/* 10) Indexes to match your schema */
CREATE INDEX IF NOT EXISTS "Essential_appId_status_createdAt_idx"
  ON "Essential"("appId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "Planned_creatorId_createdAt_idx"
  ON "Planned"("creatorId", "createdAt");
