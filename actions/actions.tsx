"use server";

import { auth } from "@/auth";
import { TableRowData } from "@/components/(essential)/table/essentials-columns";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/util/error-handler";
import { Row } from "@tanstack/react-table";
import { AuthError, Session } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const getAllAppsAction = async () => {
  console.log("getAllAppsAction");
  const session = await auth();
  let apps;
  if (!session?.user) redirect("/login");
  try {
    apps = await prisma.team.findMany({
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
    const userWithTeams = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        teams: {
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
    if (!userWithTeams) {
      redirect("/404");
    }
    return userWithTeams.teams;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
};

export const getAppFromSubdomainAction = async (
  subdomain: string
): Promise<{
  id: string;
  name: string;
  description: string | null;
  subdomain: string | null;
}> => {
  console.log("getAppFromSubdomainAction");

  const session = await auth();
  if (!session?.user) redirect("/login");
  let app;
  try {
    app = await prisma.team.findFirst({
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

export async function getEssentialsBySubdomain(subdomain: string) {
  console.log("getEssentialsBySubdomain");

  const session: Session | null = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const app = await isUserBelongsTheApp(subdomain, session);
  const essentials = await prisma.essentials.findMany({
    where: {
      teamId: app.id,
      userId: session.user.id,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formatted = essentials.map((item) => ({
    id: item.id,
    title: item.title,
    price: item.price.toNumber(),
    status: item.status,
    quantity: item.quantity,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    user: {
      name: item.user.name ?? "",
    },
  }));
  return formatted;
}

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
    await prisma.team.create({
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

export async function updateStatusEssentials(
  previusState: unknown,
  row: Row<TableRowData>,
  status: string
): Promise<{ status: "success" | "error"; message: string }> {
  console.log("updateStatusEssentials");
  const { id } = row.original;
  try {
    await prisma.essentials.update({
      where: { id },
      data: {
        status: status,
      },
    });
    revalidatePath("/dashboard/essentials-v2");
    return {
      status: "success",
      message: "O item foi atualizado com sucesso!",
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteEssentials(
  previusState: unknown,
  row: Row<TableRowData>
): Promise<{ status: "success" | "error"; message: string }> {
  console.log("deleteEssentials");
  try {
    const { id } = row.original;
    await prisma.essentials.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/essentials-v2");
    return {
      status: "success",
      message: "O Essentials foi deletado com sucesso!",
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateEssentials(
  prevState: unknown,
  formData: FormData,
  id: string
) {
  console.log("updateEssentials");
  try {
    const title = formData.get("title") as string;
    const priceString = formData.get("price") as string;
    const quantityString = formData.get("quantity") as string;
    const price = parseFloat(priceString);
    const quantity = parseInt(quantityString, 10);
    await prisma.essentials.update({
      where: { id },
      data: {
        title,
        price,
        quantity,
      },
    });
    revalidatePath("/dashboard/essentials-v2");
    return {
      status: "success",
      message: "O Essentials foi atualizado com sucesso!",
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
  const app = await prisma.team.findFirst({
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
