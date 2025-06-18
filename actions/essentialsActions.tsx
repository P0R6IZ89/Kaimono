"use server";

import { auth } from "@/auth";
import { getErrorMessage } from "@/util/error-handler";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isUserBelongsTheApp } from "./actions";

export async function createEssentials(
  previousState: unknown,
  formData: FormData
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }
  const title = formData.get("title") as string;
  const priceString = formData.get("price") as string;
  const quantityString = formData.get("quantity") as string;
  const subdomain = formData.get("subdomain") as string;
  const price = parseFloat(priceString);
  const quantity = parseInt(quantityString, 10);

  if (isNaN(price)) {
    throw new Error("Invalid price value provided.");
  }
  if (isNaN(quantity)) {
    throw new Error("Invalid quantity value provided.");
  }
  try {
    const app = await isUserBelongsTheApp(subdomain, session);
    if (!app) {
      throw new Error("Team not found for subdomain: " + subdomain);
    }
    await prisma.essentials.create({
      data: {
        title,
        price,
        status: "pending",
        quantity,
        user: {
          connect: { id: session.user.id },
        },
        app: {
          connect: { id: app.id },
        },
      },
    });
    revalidatePath(`/s/${subdomain}/essentials`);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getEssentialsBySubdomain(subdomain: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }
  try {
    const app = await isUserBelongsTheApp(subdomain, session);
    const essentials = await prisma.essentials.findMany({
      where: {
        appId: app.id,
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
    if (essentials.length === 0) {
      return [];
    }
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
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateEssentials(
  prevState: unknown,
  formData: FormData,
  id: string
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }

  const title = formData.get("title") as string;
  const priceString = formData.get("price") as string;
  const quantityString = formData.get("quantity") as string;
  const subdomain = formData.get("subdomain") as string;
  const price = parseFloat(priceString);
  const quantity = parseInt(quantityString, 10);
  try {
    const app = await isUserBelongsTheApp(subdomain, session);
    if (!app) {
      throw new Error("Team not found for subdomain: " + subdomain);
    }
    await prisma.essentials.update({
      where: { id },
      data: {
        title,
        price,
        quantity,
        user: {
          connect: { id: session.user.id },
        },
        app: {
          connect: { id: app.id },
        },
      },
    });
    revalidatePath(`/s/${subdomain}/essentials`);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateStatusEssentials(
  previusState: unknown,
  id: string,
  status: string
): Promise<{ status: "success" | "error"; message: string }> {
  console.log("updateStatusEssentials");
  try {
    await prisma.essentials.update({
      where: { id },
      data: {
        status: status,
      },
    });
    revalidatePath(`/s`);
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
  id: string,
  subdomain: string
): Promise<{ status: "success" | "error"; message: string }> {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }
  const app = await isUserBelongsTheApp(subdomain, session);
  if (!app) {
    throw new Error("Team not found for subdomain: " + subdomain);
  }
  try {
    await prisma.essentials.delete({
      where: {
        id,
      },
    });
    revalidatePath(`/s`);
    return {
      status: "success",
      message: "O Essentials foi deletado com sucesso!",
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}
