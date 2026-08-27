"use server";

import { auth, unstable_update } from "@/auth";
import { getCurrentLocale, redirect } from "@/i18n/navigation";
import prisma from "@/lib/prisma";
import type { ActionResult } from "@/lib/initial-action-return";
import {
  decryptTwoFactorSecret,
  encryptTwoFactorSecret,
  generateRecoveryCodes,
  generateTwoFactorSecret,
  getTwoFactorOtpAuthUrl,
  hashRecoveryCode,
  normalizeRecoveryCode,
  verifyTotpCode,
} from "@/lib/two-factor";
import { redirect as nextRedirect } from "next/navigation";
import QRCode from "qrcode";

type SessionUpdate = {
  requiresTwoFactor: boolean;
  twoFactorVerified: boolean;
  twoFactorVerifiedAt: string | null;
};

type TwoFactorSetupData = {
  qrCodeDataUrl: string;
  otpAuthUrl: string;
};

type TwoFactorStatusData = {
  enabled: boolean;
  recoveryCodeCount: number;
};

type RecoveryCodesData = {
  recoveryCodes: string[];
};

function safeCallbackPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function getFormCode(formData: FormData) {
  return String(formData.get("code") ?? "").trim();
}

async function updateTwoFactorSession(update: SessionUpdate) {
  await unstable_update(update as unknown as Parameters<typeof unstable_update>[0]);
}

async function requireAuthenticatedUser() {
  const session = await auth();
  const locale = await getCurrentLocale();

  if (!session?.user?.id) redirect({ href: "/login", locale });
  if (session?.isDemo) redirect({ href: "/home", locale });
  const authenticatedSession = session as NonNullable<typeof session> & {
    user: NonNullable<typeof session>["user"] & { id: string };
  };

  return {
    id: authenticatedSession.user.id,
    email: authenticatedSession.user.email ?? "",
    requiresTwoFactor: Boolean(authenticatedSession.requiresTwoFactor),
    twoFactorVerified: Boolean(authenticatedSession.twoFactorVerified),
  };
}

async function requireFullyAuthenticatedUser() {
  const user = await requireAuthenticatedUser();
  const locale = await getCurrentLocale();

  if (user.requiresTwoFactor && !user.twoFactorVerified) {
    redirect({ href: "/two-factor", locale });
  }

  return user;
}

async function verifyUserSecondFactor(userId: string, code: string) {
  const twoFactor = await prisma.userTwoFactor.findUnique({
    where: { userId },
    select: { secret: true, enabledAt: true },
  });

  if (!twoFactor?.enabledAt) return false;

  const secret = decryptTwoFactorSecret(twoFactor.secret);
  if (await verifyTotpCode(secret, code)) return true;

  const normalizedRecoveryCode = normalizeRecoveryCode(code);
  if (!normalizedRecoveryCode) return false;

  const codeHash = hashRecoveryCode(userId, normalizedRecoveryCode);
  const recoveryCode = await prisma.twoFactorRecoveryCode.findUnique({
    where: { userId_codeHash: { userId, codeHash } },
    select: { id: true, usedAt: true },
  });

  if (!recoveryCode || recoveryCode.usedAt) return false;

  const result = await prisma.twoFactorRecoveryCode.updateMany({
    where: { id: recoveryCode.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  return result.count === 1;
}

function recoveryCodeRows(userId: string, recoveryCodes: string[]) {
  return recoveryCodes.map((code) => ({
    userId,
    codeHash: hashRecoveryCode(userId, code),
  }));
}

export async function getTwoFactorStatus(): Promise<
  ActionResult<TwoFactorStatusData>
> {
  const user = await requireFullyAuthenticatedUser();

  const [twoFactor, recoveryCodeCount] = await Promise.all([
    prisma.userTwoFactor.findUnique({
      where: { userId: user.id },
      select: { enabledAt: true },
    }),
    prisma.twoFactorRecoveryCode.count({
      where: { userId: user.id, usedAt: null },
    }),
  ]);

  return {
    ok: true,
    data: {
      enabled: Boolean(twoFactor?.enabledAt),
      recoveryCodeCount,
    },
  };
}

export async function startTwoFactorSetup(): Promise<
  ActionResult<TwoFactorSetupData>
> {
  const user = await requireFullyAuthenticatedUser();

  const existingTwoFactor = await prisma.userTwoFactor.findUnique({
    where: { userId: user.id },
    select: { enabledAt: true },
  });

  if (existingTwoFactor?.enabledAt) {
    return { ok: false, message: "alreadyEnabled" };
  }

  const secret = generateTwoFactorSecret();
  const otpAuthUrl = getTwoFactorOtpAuthUrl(user.email, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

  await prisma.userTwoFactor.upsert({
    where: { userId: user.id },
    update: {
      secret: encryptTwoFactorSecret(secret),
      enabledAt: null,
    },
    create: {
      userId: user.id,
      secret: encryptTwoFactorSecret(secret),
    },
  });

  return {
    ok: true,
    data: {
      qrCodeDataUrl,
      otpAuthUrl,
    },
  };
}

export async function confirmTwoFactorSetup(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult<RecoveryCodesData>> {
  const user = await requireFullyAuthenticatedUser();
  const code = getFormCode(formData);

  const twoFactor = await prisma.userTwoFactor.findUnique({
    where: { userId: user.id },
    select: { secret: true, enabledAt: true },
  });

  if (!twoFactor || twoFactor.enabledAt) {
    return { ok: false, message: "setupMissing" };
  }

  const secret = decryptTwoFactorSecret(twoFactor.secret);
  if (!(await verifyTotpCode(secret, code))) {
    return { ok: false, message: "invalidCode" };
  }

  const recoveryCodes = generateRecoveryCodes();

  await prisma.$transaction(async (tx) => {
    await tx.userTwoFactor.update({
      where: { userId: user.id },
      data: { enabledAt: new Date() },
    });
    await tx.twoFactorRecoveryCode.deleteMany({
      where: { userId: user.id },
    });
    await tx.twoFactorRecoveryCode.createMany({
      data: recoveryCodeRows(user.id, recoveryCodes),
    });
  });

  await updateTwoFactorSession({
    requiresTwoFactor: true,
    twoFactorVerified: true,
    twoFactorVerifiedAt: new Date().toISOString(),
  });

  return {
    ok: true,
    message: "enabled",
    data: { recoveryCodes },
  };
}

export async function verifyTwoFactorChallenge(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireAuthenticatedUser();
  const callbackUrl = safeCallbackPath(
    String(formData.get("callbackUrl") ?? ""),
  );
  const code = getFormCode(formData);

  const twoFactor = await prisma.userTwoFactor.findUnique({
    where: { userId: user.id },
    select: { enabledAt: true },
  });

  if (!twoFactor?.enabledAt) {
    await updateTwoFactorSession({
      requiresTwoFactor: false,
      twoFactorVerified: true,
      twoFactorVerifiedAt: new Date().toISOString(),
    });
    nextRedirect(callbackUrl);
  }

  const verified = await verifyUserSecondFactor(user.id, code);
  if (!verified) {
    return { ok: false, message: "invalidCode" };
  }

  await updateTwoFactorSession({
    requiresTwoFactor: true,
    twoFactorVerified: true,
    twoFactorVerifiedAt: new Date().toISOString(),
  });

  nextRedirect(callbackUrl);
}

export async function disableTwoFactor(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireFullyAuthenticatedUser();
  const code = getFormCode(formData);

  const verified = await verifyUserSecondFactor(user.id, code);
  if (!verified) {
    return { ok: false, message: "invalidCode" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.twoFactorRecoveryCode.deleteMany({
      where: { userId: user.id },
    });
    await tx.userTwoFactor.deleteMany({
      where: { userId: user.id },
    });
  });

  await updateTwoFactorSession({
    requiresTwoFactor: false,
    twoFactorVerified: true,
    twoFactorVerifiedAt: new Date().toISOString(),
  });

  return { ok: true, message: "disabled" };
}

export async function regenerateRecoveryCodes(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult<RecoveryCodesData>> {
  const user = await requireFullyAuthenticatedUser();
  const code = getFormCode(formData);

  const verified = await verifyUserSecondFactor(user.id, code);
  if (!verified) {
    return { ok: false, message: "invalidCode" };
  }

  const recoveryCodes = generateRecoveryCodes();

  await prisma.$transaction(async (tx) => {
    await tx.twoFactorRecoveryCode.deleteMany({
      where: { userId: user.id },
    });
    await tx.twoFactorRecoveryCode.createMany({
      data: recoveryCodeRows(user.id, recoveryCodes),
    });
  });

  return {
    ok: true,
    message: "recoveryCodesRegenerated",
    data: { recoveryCodes },
  };
}
