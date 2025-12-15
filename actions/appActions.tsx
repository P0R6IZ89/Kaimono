"use server";

import { auth } from "@/auth";
import type { Session } from "next-auth";
import { appSchema } from "@/util/form-zod-schema";
import { $Enums, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentLocale, redirect } from "@/i18n/navigation";
import prisma from "@/lib/prisma";
import { protocol, rootDomain } from "@/util/utils";

export type Result<T = unknown> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string; code?: string };

function normalizeSubdomain(s: string) {
  const cleaned = s
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned;
}

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "static",
  "assets",
]);

function assertAllowedSubdomain(sub: string) {
  if (!sub) throw new Error("Subdomain is required.");
  if (sub.length < 3)
    throw new Error("Subdomain must be at least 3 characters.");
  if (RESERVED_SUBDOMAINS.has(sub))
    throw new Error("This subdomain is reserved.");
  if (!/^[a-z0-9-]+$/.test(sub))
    throw new Error("Subdomain may contain a–z, 0–9, and hyphens only.");
  if (/--/.test(sub))
    throw new Error("Subdomain cannot contain consecutive hyphens.");
}

type SessionWithUser = Session & {
  user: { id: string; name: string | null; email: string };
};

export async function requireSession(): Promise<SessionWithUser> {
  const s = await auth();
  const locale = await getCurrentLocale();
  if (!s?.user?.id) redirect({ href: "/login", locale });
  return s as SessionWithUser;
}

export async function requireMembership(subdomain: string) {
  const session = await requireSession();
  const app = await prisma.app.findUnique({
    where: { subdomain },
    select: { id: true },
  });
  const locale = await getCurrentLocale();
  if (!app) redirect({ href: "/new-app", locale });

  const membership = await prisma.membership.findUnique({
    where: { appId_userId: { appId: app.id, userId: session.user.id } },
    select: { role: true },
  });
  if (!membership) {
    redirect({ href: "/new-app", locale });
  }
  return { appId: app.id, role: membership.role as $Enums.Role, session };
}

export async function getAllAppsAction() {
  const session = await requireSession();

  const apps = await prisma.app.findMany({
    where: { memberships: { some: { userId: session.user.id } } },
    include: {
      _count: { select: { memberships: true } },
      memberships: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // This adds the currentUserRole found in the first membership for convenience.
  return apps.map((a) => ({
    ...a,
    currentUserRole: a.memberships[0]?.role ?? null,
  }));
}

export async function getCurrentAppAction(subdomain: string) {
  await requireMembership(subdomain);

  const app = await prisma.app.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      description: true,
      subdomain: true,
      image: true,
      _count: { select: { memberships: true } },
    },
  });

  return app;
}

type FormDataShape = z.infer<typeof appSchema>;

export async function createAppAction(prevState: unknown, formData: FormData) {
  const data: FormDataShape = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    subdomain: String(formData.get("subdomain") ?? ""),
  };

  const parsed = appSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.errors[0].message,
    } satisfies Result;
  }

  const session = await requireSession();
  const userId = session.user.id;
  const locale = await getCurrentLocale();

  const normalized = normalizeSubdomain(parsed.data.subdomain);
  try {
    assertAllowedSubdomain(normalized);
  } catch (e) {
    return { ok: false, message: (e as Error).message } satisfies Result;
  }

  const { name, description } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const app = await tx.app.create({
        data: { name, description, subdomain: normalized },
      });

      await tx.membership.create({
        data: { appId: app.id, userId, role: "OWNER" },
      });
    });

    revalidatePath("/");
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const field = Array.isArray(error.meta?.target)
          ? String(error.meta.target[0])
          : String(error.meta?.target || "");
        if (field.includes("subdomain")) {
          return {
            ok: false,
            message: "That subdomain is already taken. Please choose another.",
            code: "SUBDOMAIN_TAKEN",
          } satisfies Result;
        }
        if (field.includes("customDomain")) {
          return {
            ok: false,
            message: "That custom domain is already in use.",
            code: "CUSTOM_DOMAIN_TAKEN",
          } satisfies Result;
        }
      }
    }
    return {
      ok: false,
      message: "An unexpected error occurred. Please try again.",
    } satisfies Result;
  }
  redirect({ href: `${protocol}://${normalized}.${rootDomain}`, locale });
}

export async function isUserBelongsTheApp(subdomain: string) {
  const { appId } = await requireMembership(subdomain);
  return { id: appId };
}

export async function deleteApp(id: string): Promise<Result> {
  const session = await requireSession();

  const membership = await prisma.membership.findUnique({
    where: { appId_userId: { appId: id, userId: session.user.id } },
    select: { role: true },
  });
  if (!membership)
    return { ok: false, message: "You are not a member of this app." };
  if (membership.role !== "OWNER")
    return { ok: false, message: "Only Owners can delete the app." };

  try {
    await prisma.app.delete({ where: { id } });
    revalidatePath("/");
    return { ok: true, message: "App deleted." };
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: true, message: "App not found (already deleted)." };
    }
    return { ok: false, message: "Failed to delete app." };
  }
}

export async function removeMemberAction(
  subdomain: string,
  targetUserId: string
): Promise<Result> {
  const {
    appId,
    role: actingRole,
    session,
  } = await requireMembership(subdomain);
  const actingUserId = session.user.id;

  const targetMembership = await prisma.membership.findUnique({
    where: { appId_userId: { appId, userId: targetUserId } },
    select: { role: true, userId: true },
  });

  if (!targetMembership) {
    revalidatePath(`/s/${subdomain}/settings/members`);
    return { ok: true, message: "User is not a member." };
  }

  const removingSelf = actingUserId === targetUserId;

  if (!removingSelf) {
    if (actingRole === "MEMBER") {
      return { ok: false, message: "Insufficient permission." };
    }
    if (actingRole === "ADMIN" && targetMembership.role === "ADMIN") {
      return { ok: false, message: "Admins cannot remove other Admins." };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.membership.findUnique({
        where: { appId_userId: { appId, userId: targetUserId } },
        select: { role: true },
      });
      if (!fresh) return;

      if (fresh.role === "OWNER") {
        const ownerCount = await tx.membership.count({
          where: { appId, role: "OWNER" },
        });
        if (ownerCount <= 1) {
          throw new Error("LAST_OWNER");
        }
      }

      await tx.membership.delete({
        where: { appId_userId: { appId, userId: targetUserId } },
      });
    });

    revalidatePath(`/s/${subdomain}/settings/members`);
    revalidatePath(`/s/${subdomain}`);
    return {
      ok: true,
      message: removingSelf ? "You left the app." : "User removed.",
    };
  } catch (e) {
    if (e instanceof Error && e.message === "LAST_OWNER") {
      return {
        ok: false,
        message: "Cannot remove the last Owner. Promote another user first.",
      };
    }
    return { ok: false, message: "Failed to remove member." };
  }
}

export async function getMembership(
  subdomain: string
): Promise<$Enums.Role | null> {
  const session = await requireSession();
  const app = await prisma.app.findUnique({
    where: { subdomain },
    select: { id: true },
  });
  if (!app) return null;

  const membership = await prisma.membership.findUnique({
    where: { appId_userId: { appId: app.id, userId: session.user.id } },
    select: { role: true },
  });

  return membership?.role ?? null;
}

export async function userHasApps(): Promise<boolean> {
  const session = await requireSession();
  const count = await prisma.membership.count({
    where: { userId: session.user.id },
  });
  return count > 0;
}
