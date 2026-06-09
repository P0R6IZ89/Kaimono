import prisma from "@/lib/prisma";
import type { Prisma } from "@/prisma/generated/prisma";

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
  if (packId in AI_CREDIT_PACKS) {
    return AI_CREDIT_PACKS[packId as AiCreditPackId];
  }

  return null;
}

export async function getAiCreditBalance(userId: string) {
  const result = await prisma.aiCreditLedger.aggregate({
    where: { userId },
    _sum: { amount: true },
  });

  return result._sum.amount ?? 0;
}

export async function grantAiCredits(input: {
  userId: string;
  credits: number;
  description: string;
  externalId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  if (!Number.isInteger(input.credits) || input.credits <= 0) {
    throw new Error("Credits must be a positive integer.");
  }

  await prisma.aiCreditLedger.create({
    data: {
      userId: input.userId,
      type: "PURCHASE",
      amount: input.credits,
      description: input.description,
      externalId: input.externalId,
      metadata: input.metadata,
    },
  });
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function grantSignupAiCredits(userId: string) {
  try {
    await prisma.aiCreditLedger.create({
      data: {
        userId,
        type: "ADJUSTMENT",
        amount: FREE_SIGNUP_CREDITS,
        description: "New user AI extraction credits",
        externalId: `free_signup:${userId}`,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return;
    }

    throw error;
  }
}

export async function deductAiExtractionCredit(userId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

    const result = await tx.aiCreditLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    const balance = result._sum.amount ?? 0;

    if (balance < AI_EXTRACTION_CREDIT_COST) {
      return { ok: false as const, balance };
    }

    await tx.aiCreditLedger.create({
      data: {
        userId,
        type: "DEDUCTION",
        amount: -AI_EXTRACTION_CREDIT_COST,
        description: "AI product extraction",
      },
    });

    return {
      ok: true as const,
      balance: balance - AI_EXTRACTION_CREDIT_COST,
    };
  });
}
