"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/util/error-handler";
import { AuthError, Session } from "next-auth";
import { redirect } from "next/navigation";

export const getAllAppsAction = async () => {
  console.log("getAllAppsAction");
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
    throw new Error(getErrorMessage(error));
  }
  return apps;
};

export const getUserAppsAction = async () => {
  console.log("getAppsAction");
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    const userWithApps = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        apps: {
          select: {
            id: true,
            name: true,
            description: true,
            subdomain: true,
            customDomain: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    if (!userWithApps) {
      redirect("/404");
    }
    return userWithApps.apps;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
};

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
  let app;
  try {
    app = await prisma.app.findFirst({
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
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
  if (!app) {
    throw new Error(
      `No app found with subdomain="${subdomain}" for this user.`
    );
  }
  return app;
};

export const createAppAction = async (
  prevState: unknown,
  formData: FormData
): Promise<{ error: string } | undefined> => {
  console.log("createAppAction");

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
    throw new Error(getErrorMessage(error));
  }
  redirect("/");
};

export const getAccountByUserId = async (userId: string) => {
  console.log("getAccountByUserId");
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
      },
    });
    return account;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Don't need a Google provider Account
export const getUserById = async (id: string) => {
  console.log("getUserById");
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
};

export async function getCount() {
  console.log("getCount");
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
    throw new Error(getErrorMessage(error));
  }
}

export async function isUserBelongsTheApp(
  subdomain: string,
  session: Session | null
): Promise<{ id: string }> {
  console.log("isUserBelongsTheApp");
  if (!session?.user) {
    redirect("/login");
  }
  const app = await prisma.app.findUnique({
    where: {
      subdomain: subdomain,
      user: {
        some: { id: session.user.id },
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
}
