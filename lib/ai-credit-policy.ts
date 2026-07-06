export const AI_EXTRACTION_CREDIT_COST = 10;
export const FREE_SIGNUP_CREDITS = 200;

export const AI_CREDIT_PACKS = {
  starter: {
    id: "starter",
    credits: 100,
    amountCents: 100,
    name: "100 AI extraction credits",
  },
  value: {
    id: "value",
    credits: 350,
    amountCents: 300,
    name: "350 AI extraction credits",
  },
} as const;

export type AiCreditPackId = keyof typeof AI_CREDIT_PACKS;

export function getAiCreditPack(packId: string) {
  if (Object.prototype.hasOwnProperty.call(AI_CREDIT_PACKS, packId)) {
    return AI_CREDIT_PACKS[packId as AiCreditPackId];
  }

  return null;
}

export function calculateAiExtractionDeduction(balance: number) {
  if (balance < AI_EXTRACTION_CREDIT_COST) {
    return { ok: false as const, balance };
  }

  return {
    ok: true as const,
    balance: balance - AI_EXTRACTION_CREDIT_COST,
    deductionAmount: -AI_EXTRACTION_CREDIT_COST,
  };
}

export function assertPositiveIntegerCredits(credits: number) {
  if (!Number.isInteger(credits) || credits <= 0) {
    throw new Error("Credits must be a positive integer.");
  }
}
