import { describe, expect, it } from "vitest";

import {
  AI_CREDIT_PACKS,
  AI_EXTRACTION_CREDIT_COST,
  assertPositiveIntegerCredits,
  calculateAiExtractionDeduction,
  getAiCreditPack,
} from "@/lib/ai-credit-policy";

describe("getAiCreditPack", () => {
  it.each([
    { packId: "starter", expected: AI_CREDIT_PACKS.starter },
    { packId: "value", expected: AI_CREDIT_PACKS.value },
  ])("returns the $packId credit pack", ({ packId, expected }) => {
    expect(getAiCreditPack(packId)).toBe(expected);
  });

  it.each(["unknown", "toString", "__proto__"])(
    "returns null for invalid pack id %s",
    (packId) => {
      expect(getAiCreditPack(packId)).toBeNull();
    },
  );
});

describe("calculateAiExtractionDeduction", () => {
  it.each([
    { balance: 0, expected: { ok: false as const, balance: 0 } },
    { balance: 9, expected: { ok: false as const, balance: 9 } },
  ])("returns insufficient result for balance $balance", ({ balance, expected }) => {
    expect(calculateAiExtractionDeduction(balance)).toEqual(expected);
  });

  it.each([
    {
      balance: AI_EXTRACTION_CREDIT_COST,
      expectedBalance: 0,
    },
    {
      balance: AI_EXTRACTION_CREDIT_COST + 1,
      expectedBalance: 1,
    },
  ])(
    "deducts extraction cost from balance $balance",
    ({ balance, expectedBalance }) => {
      expect(calculateAiExtractionDeduction(balance)).toEqual({
        ok: true,
        balance: expectedBalance,
        deductionAmount: -AI_EXTRACTION_CREDIT_COST,
      });
    },
  );
});

describe("assertPositiveIntegerCredits", () => {
  it.each([1, 100, 350])("allows positive integer credits: %s", (credits) => {
    expect(() => assertPositiveIntegerCredits(credits)).not.toThrow();
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "throws for invalid credits: %s",
    (credits) => {
      expect(() => assertPositiveIntegerCredits(credits)).toThrow(
        "Credits must be a positive integer.",
      );
    },
  );
});
