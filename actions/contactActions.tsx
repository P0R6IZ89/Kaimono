"use server";

import { requireMembership } from "@/actions/appActions";
import { contactSchema } from "@/lib/contact-schema";
import type { ActionResult } from "@/lib/initial-action-return";
import prisma from "@/lib/prisma";
import { checkContactRateLimit } from "@/lib/rate-limit";
import { Resend } from "resend";
import type { z } from "zod";

export type ContactMessageInput = z.input<typeof contactSchema>;

export async function sendContactMessage(
  input: ContactMessageInput,
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "invalid" };
  }

  const { subdomain, fullName, email, title, description } = parsed.data;
  const membership = await requireMembership(subdomain);
  const { session, appId, role } = membership;
  if (session.isDemo) {
    return { ok: false, message: "demoRestricted" };
  }
  const [workspace, rateLimit] = await Promise.all([
    prisma.app.findUnique({
      where: { id: appId },
      select: { name: true, subdomain: true },
    }),
    checkContactRateLimit(session.user.id),
  ]);

  if (!workspace) {
    return { ok: false, message: "failed" };
  }

  if (!rateLimit.success) {
    return { ok: false, message: "rateLimited" };
  }

  const apiKey = process.env.AUTH_RESEND_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.error("[contact] Email configuration is incomplete", {
      appId,
      userId: session.user.id,
    });
    return { ok: false, message: "configuration" };
  }

  const text = [
    "New Kaimono contact message",
    "",
    `Workspace: ${workspace.name}`,
    `Workspace subdomain: ${workspace.subdomain}`,
    `Member role: ${role}`,
    `Authenticated user ID: ${session.user.id}`,
    `Authenticated user name: ${session.user.name ?? "Not provided"}`,
    `Authenticated user email: ${session.user.email}`,
    "",
    `Submitted name: ${fullName}`,
    `Submitted email: ${email}`,
    `Subject: ${title}`,
    "",
    "Message:",
    description,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Kaimono Contact] ${title}`,
      text,
    });

    if (result.error) {
      console.error("[contact] Resend rejected the message", {
        appId,
        userId: session.user.id,
        error: result.error,
      });
      return { ok: false, message: "failed" };
    }

    return { ok: true, message: "sent" };
  } catch (error) {
    console.error("[contact] Failed to send message", {
      appId,
      userId: session.user.id,
      error,
    });
    return { ok: false, message: "failed" };
  }
}
