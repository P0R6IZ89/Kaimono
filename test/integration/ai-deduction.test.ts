import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  AI_EXTRACTION_CREDIT_COST,
  deductAiExtractionCredit,
  getAiCreditBalance,
  grantAiCredits,
} from "@/lib/ai-credits";
import { cleanDatabase, createTestUser, testPrisma } from "./helpers/db";

describe("AI credit deduction", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it("deducts one extraction credit cost and writes a ledger row", async () => {
    const user = await createTestUser();
    const startingCredits = AI_EXTRACTION_CREDIT_COST + 5;

    await grantAiCredits({
      userId: user.id,
      credits: startingCredits,
      description: "Test credits",
      externalId: `test-grant:${crypto.randomUUID()}`,
    });

    const result = await deductAiExtractionCredit(user.id);

    expect(result).toEqual({
      ok: true,
      balance: 5,
    });
    await expect(getAiCreditBalance(user.id)).resolves.toBe(5);

    const ledgerRows = await testPrisma.aiCreditLedger.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    expect(ledgerRows).toHaveLength(2);
    expect(ledgerRows[0]).toMatchObject({
      type: "PURCHASE",
      amount: startingCredits,
      description: "Test credits",
    });
    expect(ledgerRows[1]).toMatchObject({
      type: "DEDUCTION",
      amount: -AI_EXTRACTION_CREDIT_COST,
      description: "AI product extraction",
    });
  });

  it("does not write a deduction row when balance is insufficient", async () => {
    const user = await createTestUser();
    const startingCredits = AI_EXTRACTION_CREDIT_COST - 1;

    await grantAiCredits({
      userId: user.id,
      credits: startingCredits,
      description: "Test credits",
      externalId: `test-grant:${crypto.randomUUID()}`,
    });

    const result = await deductAiExtractionCredit(user.id);

    expect(result).toEqual({
      ok: false,
      balance: startingCredits,
    });
    await expect(getAiCreditBalance(user.id)).resolves.toBe(startingCredits);
    await expect(
      testPrisma.aiCreditLedger.count({
        where: {
          userId: user.id,
          type: "DEDUCTION",
        },
      }),
    ).resolves.toBe(0);
  });

  it("does not write any ledger row for a zero balance user", async () => {
    const user = await createTestUser();

    const result = await deductAiExtractionCredit(user.id);

    expect(result).toEqual({
      ok: false,
      balance: 0,
    });
    await expect(getAiCreditBalance(user.id)).resolves.toBe(0);
    await expect(
      testPrisma.aiCreditLedger.count({
        where: { userId: user.id },
      }),
    ).resolves.toBe(0);
  });

  it("rejects invalid credit grants before writing a ledger row", async () => {
    const user = await createTestUser();

    await expect(
      grantAiCredits({
        userId: user.id,
        credits: 0,
        description: "Invalid grant",
      }),
    ).rejects.toThrow("Credits must be a positive integer.");

    await expect(
      testPrisma.aiCreditLedger.count({
        where: { userId: user.id },
      }),
    ).resolves.toBe(0);
  });
});
