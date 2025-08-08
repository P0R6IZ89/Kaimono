"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { protocol, rootDomain } from "@/lib/utils";
import { appSchema } from "@/util/form-zod-schema";
import { $Enums, Prisma } from "@prisma/client";
import { Session } from "next-auth";
import { revalidatePath } from "next/cache";
import { ActionResult } from "next/dist/server/app-render/types";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function getAllAppsAction() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    const apps = await prisma.app.findMany({
      where: { memberships: { some: { userId: session.user.id } } },
      include: {
        _count: {
          select: {
            memberships: true,
          },
        },
      },
    });
    return apps;
  } catch {
    return [];
  }
}

export async function getCurrentAppAction(subdomain: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const app = await prisma.app.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      description: true,
      subdomain: true,
      image: true,
    },
  });

  return app;
}

type FormDataShape = z.infer<typeof appSchema>;
export async function createAppAction(prevState: unknown, formData: FormData) {
  const data: FormDataShape = {
    name: formData.get("name")?.toString() as string,
    description: formData.get("description")?.toString() as string,
    subdomain: formData.get("subdomain")?.toString() as string,
  };

  const result = appSchema.safeParse(data);
  if (!result.success) {
    console.log(result.error);
    return { error: result.error.errors[0].message };
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const { name, description, subdomain } = result.data;
  try {
    await prisma.$transaction(async (tx) => {
      const app = await tx.app.create({
        data: { name, description, subdomain },
      });
      await tx.membership.create({
        data: {
          appId: app.id,
          userId,
          role: "OWNER",
        },
      });
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const field = Array.isArray(error.meta?.target)
        ? String(error.meta.target[0])
        : null;

      if (field === "subdomain") {
        return {
          error: "That subdomain is already taken. Please choose another.",
        };
      }
      if (field === "customDomain") {
        return { error: "That custom domain is already in use." };
      }
    }

    console.error("createAppAction error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
  redirect(`${protocol}://${subdomain}.${rootDomain}`);
}

export async function isUserBelongsTheApp(
  subdomain: string,
  session: Session | null
) {
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  console.debug("isUserBelongsTheApp called with:", { subdomain, session });
  const app = await prisma.app.findFirst({
    where: {
      subdomain,
      memberships: { some: { userId } },
    },
    select: { id: true },
  });
  if (!app) {
    console.error(
      `No app found for subdomain="${subdomain}". Looked up membership="${userId}".`
    );
    throw new Error(`No app found for subdomain="${subdomain}".`);
  }

  return { id: app.id };
}

export async function deleteApp(id: string) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  try {
    const result = await prisma.app.delete({
      where: { id },
    });
    revalidatePath("/");
    if (result) {
      return { message: { isSuccess: true } };
    }
  } catch (error) {
    return { error: `Algo deu errado ${error}` };
  }
  return { message: { isSuccess: true } };
}

export async function removeMemberAction(
  subdomain: string,
  targetUserId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }
  const actingUserId = session.user.id;
  const app = await prisma.app.findUnique({
    where: { subdomain },
    select: { id: true },
  });
  if (!app) return { success: false, message: "App not found." };

  // Load acting and target memberships
  const [actingMembdership, targetMembership] = await Promise.all([
    prisma.membership.findUnique({
      where: { appId_userId: { appId: app.id, userId: actingUserId } },
      select: { role: true, userId: true },
    }),
    prisma.membership.findUnique({
      where: { appId_userId: { appId: app.id, userId: targetUserId } },
      select: { role: true, userId: true },
    }),
  ]);

  if (!actingMembdership) {
    return { success: false, message: "You are not a member of this app." };
  }
  if (!targetMembership) {
    return { success: true, message: "User is not a member." };
  }

  const removingSelf = actingUserId === targetUserId;

  if (!removingSelf) {
    if (actingMembdership.role === "MEMBER") {
      return { success: false, message: "Insufficient permission." };
    }
    if (actingMembdership.role === "ADMIN") {
      if (targetMembership.role === "ADMIN") {
        return {
          success: false,
          message: "Admins cannot remove other Admins.",
        };
      }
    }
    try {
      await prisma.$transaction(async (tx) => {
        const freshTarget = await tx.membership.findUnique({
          where: { appId_userId: { appId: app.id, userId: targetUserId } },
          select: { role: true },
        });
        if (!freshTarget) return;
        if (freshTarget.role === "OWNER") {
          const ownerCount = await tx.membership.count({
            where: { appId: app.id, role: "OWNER" },
          });
          if (ownerCount <= 1) {
            if (ownerCount <= 1) throw new Error("LAST_OWNER");
          }
        }
        await tx.membership.delete({
          where: { appId_userId: { appId: app.id, userId: targetUserId } },
        });
      });
    } catch (e) {
      if (e instanceof Error && e.message === "LAST_OWNER") {
        return {
          success: false,
          message: "Cannot remove the last Owner. Promote another user first.",
        };
      }
      return { success: false, message: "Failed to remove member." };
    }
  }
  revalidatePath("/invite");
  return { success: true, message: "User removed." };
}

export async function getMembership(
  subdomain: string
): Promise<$Enums.Role | null> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const app = await prisma.app.findUnique({
    where: { subdomain },
    select: { id: true },
  });
  if (!app) {
    redirect("/new-app");
  }
  const membership = await prisma.membership.findUnique({
    where: { appId_userId: { appId: app.id, userId } },
    select: { role: true },
  });

  return membership?.role ?? null;
}
