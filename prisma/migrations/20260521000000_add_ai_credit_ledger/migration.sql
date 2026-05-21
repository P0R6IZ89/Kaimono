CREATE TYPE "AiCreditLedgerType" AS ENUM ('PURCHASE', 'DEDUCTION', 'REFUND', 'ADJUSTMENT');

CREATE TABLE "AiCreditLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AiCreditLedgerType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "externalId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiCreditLedger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiCreditLedger_externalId_key" ON "AiCreditLedger"("externalId");

CREATE INDEX "AiCreditLedger_userId_createdAt_idx" ON "AiCreditLedger"("userId", "createdAt");

ALTER TABLE "AiCreditLedger" ADD CONSTRAINT "AiCreditLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
