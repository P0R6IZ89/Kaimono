"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/util/error-handler";
import { AuthError, Session } from "next-auth";
import { redirect } from "next/navigation";

export const getAllAppsAction = async () => {
  const session = await auth();
  let apps;
  if (!session?.user) redirect("/login");
  try {
    apps = await prisma.app.findMany({
      where: {
        user: {
          some: {
            id: session.user.id,
          },
        },
      },
    });
  } catch (error: unknown) {
    console.error("[getAllAppsAction] unexpected error:", error);
    throw new Error(getErrorMessage(error));
  }
  return apps;
};

// Get all apps of the logged user
export async function getUserAppsAction() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    const apps = await prisma.app.findMany({
      where: { user: { some: { id: session.user.id } } },
      include: {
        _count: {
          select: {
            user: true,
          },
        },
      },
    });

    return apps;
  } catch (error: unknown) {
    console.error("[getUserAppsAction] unexpected error:", error);
    throw new Error("Unable to retrieve your apps. Please try again later.");
  }
}

export const getAppFromSubdomainAction = async (
  subdomain: string
): Promise<{
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  subdomain: string | null;
}> => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    const app = await prisma.app.findFirst({
      where: {
        subdomain,
        user: {
          some: {
            id: session.user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        subdomain: true,
        image: true,
      },
    });
    if (!app) {
      console.error(
        `[getAppFromSubdomainAction] no app found for subdomain="${subdomain}" and userId="${session.user.id}"`
      );
      throw new Error(
        `No app found with subdomain \"${subdomain}\" for the current user.`
      );
    }
    return app;
  } catch (error: unknown) {
    console.error("[getAppFromSubdomainAction] unexpected error:", error);
    throw new Error(getErrorMessage(error));
  }
};

export const createAppAction = async (
  prevState: unknown,
  formData: FormData
): Promise<{ error: string } | undefined> => {
  const session = await auth();
  if (!session?.user)
    throw new AuthError("Unauthorized. User session not found.");
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const subdomain = formData.get("subdomain") as string;
  try {
    await prisma.app.create({
      data: {
        name,
        description,
        subdomain,
        user: {
          connect: { id: session.user.id },
        },
      },
    });
  } catch (error: unknown) {
    console.error("[createAppAction] unexpected error:", error);
    throw new Error(getErrorMessage(error));
  }
  redirect("/");
};

export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
      },
    });
    return account;
  } catch (error: unknown) {
    console.error("[getAccountByUserId] unexpected error:", error);
    throw new Error(getErrorMessage(error));
  }
};

// Don't need a Google provider Account
export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error: unknown) {
    console.error("[getUserById] unexpected error:", error);
    throw new Error(getErrorMessage(error));
  }
};

export async function getCount() {
  try {
    const fullCount = await prisma.essentials.count({});
    const pendingCount = await prisma.essentials.count({
      where: { status: "pending" },
    });

    return {
      success: true,
      data: { fullCount, pendingCount },
    };
  } catch (error: unknown) {
    console.error("[getCount] unexpected error:", error);
    throw new Error(getErrorMessage(error));
  }
}

export async function isUserBelongsTheApp(
  subdomain: string,
  session: Session | null
): Promise<{ id: string }> {
  if (!session?.user) {
    redirect("/login");
  }
  try {
    const app = await prisma.app.findUnique({
      where: {
        subdomain,
        user: {
          some: {
            id: session.user.id,
          },
        },
      },
      select: { id: true },
    });
    if (!app) {
      throw new Error(
        `Cannot find any app with subdomain="${subdomain}" for this user.`
      );
    }
    return { id: app.id };
  } catch (error: unknown) {
    console.error("[isUserBelongsTheApp] unexpected error:", error);
    throw error;
  }
}
