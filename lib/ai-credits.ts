import prisma from "@/lib/prisma";
import type { Prisma } from "@/prisma/generated/prisma";
import {
  assertPositiveIntegerCredits,
  calculateAiExtractionDeduction,
  FREE_SIGNUP_CREDITS,
} from "@/lib/ai-credit-policy";

export {
  AI_CREDIT_PACKS,
  AI_EXTRACTION_CREDIT_COST,
  FREE_SIGNUP_CREDITS,
  getAiCreditPack,
} from "@/lib/ai-credit-policy";
export type { AiCreditPackId } from "@/lib/ai-credit-policy";

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
  assertPositiveIntegerCredits(input.credits);

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
    const deduction = calculateAiExtractionDeduction(balance);

    if (!deduction.ok) {
      return deduction;
    }

    await tx.aiCreditLedger.create({
      data: {
        userId,
        type: "DEDUCTION",
        amount: deduction.deductionAmount,
        description: "AI product extraction",
      },
    });

    return {
      ok: true as const,
      balance: deduction.balance,
    };
  });
}
