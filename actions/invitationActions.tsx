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
import type { Role } from "@prisma/client";
import { protocol, rootDomain } from "@/lib/variables";

function canManageInvites(role: Role) {
  return role === "OWNER" || role === "ADMIN";
}

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
  const appName = formData.get("appName");
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
      message: "Você não tem permissão para convidar usuários.",
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

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Convite</title>
</head>
<body style="margin:0; padding:20px; background-color:#f9f9f9; font-family:Arial,sans-serif;">
  <p>
    Clique em 
    <a 
      href="${protocol}://${rootDomain}/invite/accept?token=${token}" 
      style="color:#1a73e8; text-decoration:none; font-weight:bold;"
      target="_blank"
    >
      aqui
    </a> 
    para aceitar seu convite.
  </p>
</body>
</html>
`;

  const resend = new Resend(process.env.AUTH_RESEND_KEY);
  await resend.emails.send({
    from: process.env.INVITE_FROM_EMAIL!,
    to: parse.data.email,
    subject: `Você foi convidado a participar ${appName}`,
    html,
  });
  revalidatePath("/invite");
  return { ok: true, message: "Convite enviado com sucesso!" };
}

export async function acceptInviteAction(token: string) {
  const session = await auth();

  if (!session?.user?.id) {
    const returnTo = encodeURIComponent(`/invite/accept?token=${token}`);
    NextRedirect(`${protocol}://${rootDomain}/login?callbackUrl=${returnTo}`);
  }
  const userId = session.user.id;

  const invite = await prisma.invitation.findUnique({
    where: { token },
  });
  if (!invite) {
    return { error: "Convite inválido ou expirado." };
  }

  if (invite.status === "ACCEPTED") {
    return { success: true, alreadyAccepted: true, appId: invite.appId };
  }

  if (invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return { error: "Convite inválido ou expirado." };
  }

  if (normalizeEmail(session.user.email) !== normalizeEmail(invite.email)) {
    return {
      error:
        "Este convite pertence a outro e-mail. Entre com o e-mail convidado para continuar.",
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
    return { ok: false, message: "Unauthorized. Please log in." };
  }

  const me = session.user.id;

  const invite = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { app: true },
  });
  if (!invite) {
    return { ok: false, message: "Invitation not found" };
  }

  if (!(await getInviteManagerMembership(invite.appId, me))) {
    return {
      ok: false,
      message: "You don’t have permission to resend this invitation.",
    };
  }

  if (invite.status !== "PENDING" && invite.status !== "REVOKED") {
    return {
      ok: false,
      message: "Only pending or revoked invitations may be resent.",
    };
  }
  const newExpiry = addDays(new Date(), 9);
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { expiresAt: newExpiry, status: "PENDING" },
  });

  const resend = new Resend(process.env.AUTH_RESEND_KEY!);
  const acceptUrl = new URL(
    `/invite/accept?token=${invite.token}`,
    `${protocol}://${rootDomain}`,
  ).toString();

  await resend.emails.send({
    from: process.env.INVITE_LOGIN_FROM_EMAIL!,
    to: invite.email,
    subject: `Reminder: Invitation to join ${invite.app.name}`,
    html: `
      <p>Hello,</p>
      <p>This is a reminder that you were invited to join <strong>${invite.app.name}</strong>.</p>
      <p><a href="${acceptUrl}">Click here to accept</a> (expires ${newExpiry.toDateString()}).</p>
    `,
  });
  revalidatePath("/invite");
  return { ok: true, message: "Invitation resent successfully." };
}

export async function revokeInviteAction(
  invitationId: string,
): Promise<ActionResult> {
  const session = await requireSession();
  const me = session.user.id;
  const invite = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });
  if (!invite) {
    return { ok: false, message: "Convite não encontrado." };
  }

  if (!(await getInviteManagerMembership(invite.appId, me))) {
    return {
      ok: false,
      message: "You do not have permission to revoke this invitation.",
    };
  }
  if (invite.status !== "PENDING" && invite.status !== "EXPIRED") {
    return {
      ok: false,
      message: "Only pending or expired invitations can be revoked.",
    };
  }
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "REVOKED", revokedAt: new Date() },
  });
  revalidatePath("/invite");
  return { ok: true, message: "Invitation revoked successfully." };
}
