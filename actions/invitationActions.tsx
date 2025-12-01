"use server";

import { Resend } from "resend";
import { auth } from "@/auth";
import { makeInviteToken } from "@/lib/make-invite-token";
import prisma from "@/lib/prisma";
import { inviteSchema } from "@/util/form-zod-schema";
import { redirect } from "next/navigation";
import { protocol, rootDomain } from "@/lib/utils";
import { addDays } from "@/lib/addDays";
import { ActionResult } from "next/dist/server/app-render/types";
import { revalidatePath } from "next/cache";
import { requireMembership } from "./appActions";

export async function getInvitedUsersActions(subdomain: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const { appId } = await requireMembership(subdomain);
  const invitedUsers = await prisma.invitation.findMany({
    where: { appId },
    orderBy: { createdAt: "desc" },
  });
  return invitedUsers;
}

export async function createInviteAction(
  prevState: unknown,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const appName = formData.get("appName");
  const raw = {
    appId: formData.get("appId"),
    email: formData.get("email"),
    role: formData.get("role") ?? undefined,
  };
  const parse = inviteSchema.safeParse(raw);
  if (!parse.success) {
    return { error: parse.error.errors[0].message };
  }

  const me = session.user.id;
  const membership = await prisma.membership.findUnique({
    where: { appId_userId: { appId: parse.data.appId, userId: me } },
  });
  if (!membership || membership.role === "MEMBER") {
    return { error: "Você não tem permissão para convidar usuários." };
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
  return { success: true };
}

export async function acceptInviteAction(token: string) {
  const session = await auth();

  if (!session?.user?.id) {
    const returnTo = encodeURIComponent(`/invite/accept?token=${token}`);
    redirect(`${protocol}://${rootDomain}/login?callbackUrl=${returnTo}`);
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

interface ResendResult {
  success?: boolean;
  error?: string;
}
export async function resendInviteAction(
  invitationId: string
): Promise<ResendResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in." };
  }

  const me = session.user.id;

  const invite = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { app: true },
  });
  if (!invite) {
    return { error: "Invitation not found" };
  }

  const membership = await prisma.membership.findUnique({
    where: { appId_userId: { appId: invite.appId, userId: me } },
  });
  if (
    !membership ||
    (membership.role !== "OWNER" &&
      membership.role !== "ADMIN" &&
      invite.inviterId !== me)
  ) {
    return { error: "You don’t have permission to resend this invitation." };
  }

  if (invite.status !== "PENDING" && invite.status !== "REVOKED") {
    return { error: "Only pending or revoked invitations may be resent." };
  }
  const newExpiry = addDays(new Date(), 9);
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { expiresAt: newExpiry, status: "PENDING" },
  });

  const resend = new Resend(process.env.AUTH_RESEND_KEY!);
  const acceptUrl = new URL(
    `/invite/accept?token=${invite.token}`,
    `${protocol}://${rootDomain}`
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
  return { success: true };
}

export async function revokeInviteAction(
  invitationId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const me = session.user.id;
  const invite = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });
  if (!invite) {
    return { error: "Convite não encontrado." };
  }

  const membership = await prisma.membership.findUnique({
    where: { appId_userId: { appId: invite.appId, userId: me } },
  });
  if (
    !membership ||
    (membership.role !== "OWNER" &&
      membership.role !== "ADMIN" &&
      invite.inviterId !== me)
  ) {
    return { error: "You do not have permission to revoke this invitation." };
  }
  if (invite.status !== "PENDING" && invite.status !== "EXPIRED") {
    return { error: "Only pending or expired invitations can be revoked." };
  }
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "REVOKED", revokedAt: new Date() },
  });
  revalidatePath("/invite");
  return { success: true };
}
