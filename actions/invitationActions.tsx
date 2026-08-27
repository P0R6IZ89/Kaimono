"use server";

import { Resend } from "resend";
import { auth } from "@/auth";
import { makeInviteToken } from "@/lib/make-invite-token";
import prisma from "@/lib/prisma";
import { inviteSchema } from "@/lib/form-zod-schema";
import { addDays } from "@/lib/addDays";
import { revalidatePath } from "next/cache";
import { requireMembership, requireSession } from "./appActions";
import { redirect as NextRedirect } from "next/navigation";
import type { ActionResult } from "@/lib/initial-action-return";
import { protocol, rootDomain } from "@/lib/variables";
import { getCurrentLocale } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { canManageInvites } from "@/lib/permissions";

async function requireInviteManagerBySubdomain(subdomain: string) {
  const membership = await requireMembership(subdomain);

  if (!canManageInvites(membership.role)) {
    throw new Error("You do not have permission to manage invitations.");
  }

  return membership;
}

async function getInviteManagerMembership(appId: string, userId: string) {
  const membership = await prisma.membership.findUnique({
    where: { appId_userId: { appId, userId } },
    select: { role: true },
  });

  if (!membership || !canManageInvites(membership.role)) {
    return null;
  }

  return membership;
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function getInvitedUsersActions(subdomain: string) {
  const { appId } = await requireInviteManagerBySubdomain(subdomain);
  const invitedUsers = await prisma.invitation.findMany({
    where: { appId },
    orderBy: { createdAt: "desc" },
  });
  return invitedUsers;
}

export async function createInviteAction(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();
  if (session.isDemo) {
    return { ok: false, message: "demoRestricted" };
  }
  const appName = String(formData.get("appName") ?? "");
  const raw = {
    appId: formData.get("appId"),
    email: formData.get("email"),
    role: formData.get("role") ?? undefined,
  };
  const parse = inviteSchema.safeParse(raw);
  if (!parse.success) {
    return { ok: false, message: parse.error.errors[0].message };
  }

  const me = session.user.id;
  if (!(await getInviteManagerMembership(parse.data.appId, me))) {
    return {
      ok: false,
      message: "inviteManageDenied",
    };
  }

  const { token, expiresAt } = makeInviteToken();
  await prisma.invitation.create({
    data: {
      ...parse.data,
      inviterId: me,
      token,
      expiresAt,
    },
  });

  const locale = await getCurrentLocale();
  const tEmail = await getTranslations({ locale, namespace: "InviteEmail" });
  const acceptUrl = `${protocol}://${rootDomain}/${locale}/invite/accept?token=${token}`;
  const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${tEmail("title")}</title>
</head>
<body style="margin:0; padding:20px; background-color:#f9f9f9; font-family:Arial,sans-serif;">
  <p>
    ${tEmail("acceptPrompt")}
    <a
      href="${acceptUrl}"
      style="color:#1a73e8; text-decoration:none; font-weight:bold;"
      target="_blank"
    >
      ${tEmail("acceptLink")}
    </a> 
  </p>
</body>
</html>
`;

  const resend = new Resend(process.env.AUTH_RESEND_KEY);
  await resend.emails.send({
    from: process.env.INVITE_FROM_EMAIL!,
    to: parse.data.email,
    subject: tEmail("subject", { appName }),
    html,
  });
  revalidatePath("/invite");
  return { ok: true, message: "inviteSent" };
}

export async function acceptInviteAction(token: string) {
  const session = await auth();

  if (!session?.user?.id) {
    const returnTo = encodeURIComponent(`/invite/accept?token=${token}`);
    NextRedirect(`${protocol}://${rootDomain}/login?callbackUrl=${returnTo}`);
  }
  if (session.isDemo) {
    return { error: "demoRestricted" };
  }
  const userId = session.user.id;

  const invite = await prisma.invitation.findUnique({
    where: { token },
  });
  if (!invite) {
    return { error: "inviteInvalidOrExpired" };
  }

  if (invite.status === "ACCEPTED") {
    return { success: true, alreadyAccepted: true, appId: invite.appId };
  }

  if (invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return { error: "inviteInvalidOrExpired" };
  }

  if (normalizeEmail(session.user.email) !== normalizeEmail(invite.email)) {
    return {
      error: "inviteWrongEmail",
    };
  }

  await prisma.$transaction([
    prisma.membership.upsert({
      where: {
        appId_userId: {
          appId: invite.appId,
          userId,
        },
      },
      create: {
        appId: invite.appId,
        userId,
        role: invite.role,
      },
      update: {
        role: invite.role,
      },
    }),
    prisma.invitation.update({
      where: { id: invite.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    }),
  ]);

  return { success: true, appId: invite.appId };
}

export async function resendInviteAction(
  invitationId: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "loginRequired" };
  }
  if (session.isDemo) {
    return { ok: false, message: "demoRestricted" };
  }

  const me = session.user.id;

  const invite = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { app: true },
  });
  if (!invite) {
    return { ok: false, message: "invitationNotFound" };
  }

  if (!(await getInviteManagerMembership(invite.appId, me))) {
    return {
      ok: false,
      message: "inviteResendDenied",
    };
  }

  if (
    invite.status !== "PENDING" &&
    invite.status !== "EXPIRED" &&
    invite.status !== "REVOKED"
  ) {
    return {
      ok: false,
      message: "inviteResendInvalidStatus",
    };
  }
  const newExpiry = addDays(new Date(), 9);
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { expiresAt: newExpiry, status: "PENDING" },
  });

  const resend = new Resend(process.env.AUTH_RESEND_KEY!);
  const locale = await getCurrentLocale();
  const tEmail = await getTranslations({ locale, namespace: "InviteEmail" });
  const acceptUrl = new URL(
    `/${locale}/invite/accept?token=${invite.token}`,
    `${protocol}://${rootDomain}`,
  ).toString();
  const escapedAppName = escapeHtml(invite.app.name);

  await resend.emails.send({
    from: process.env.INVITE_FROM_EMAIL!,
    to: invite.email,
    subject: tEmail("reminderSubject", { appName: invite.app.name }),
    html: `
      <p>${tEmail("greeting")}</p>
      <p>${tEmail("reminderBody", { appName: escapedAppName })}</p>
      <p><a href="${acceptUrl}">${tEmail("acceptLink")}</a> ${tEmail("expires", { date: newExpiry.toDateString() })}</p>
    `,
  });
  revalidatePath("/invite");
  return { ok: true, message: "inviteResent" };
}

export async function revokeInviteAction(
  invitationId: string,
): Promise<ActionResult> {
  const session = await requireSession();
  if (session.isDemo) {
    return { ok: false, message: "demoRestricted" };
  }
  const me = session.user.id;
  const invite = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });
  if (!invite) {
    return { ok: false, message: "invitationNotFound" };
  }

  if (!(await getInviteManagerMembership(invite.appId, me))) {
    return {
      ok: false,
      message: "inviteRevokeDenied",
    };
  }
  if (invite.status !== "PENDING" && invite.status !== "EXPIRED") {
    return {
      ok: false,
      message: "inviteRevokeInvalidStatus",
    };
  }
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "REVOKED", revokedAt: new Date() },
  });
  revalidatePath("/invite");
  return { ok: true, message: "inviteRevoked" };
}
