"use server";

import { auth } from "@/auth";
import { getErrorMessage } from "@/util/error-handler";
import { revalidatePath } from "next/cache";
import { isUserBelongsTheApp } from "./appActions";
import prisma from "@/lib/prisma";
import { essentialsSchema } from "@/util/form-zod-schema";

export async function createEssentials(
  previousState: unknown,
  formData: FormData
) {
  const title = formData.get("title")?.toString() as string;
  const status = formData.get("status")?.toString() ?? "pending";
  const subdomain = formData.get("subdomain")?.toString() as string;
  const priceString = formData.get("price")?.toString() ?? "";
  const rawPrice = parseFloat(priceString);
  const price = isNaN(rawPrice) ? 0 : rawPrice;
  const quantityString = formData.get("quantity")?.toString() as string;
  const quantity = parseInt(quantityString, 10);

  const result = essentialsSchema.safeParse({
    title,
    status,
    price,
    quantity,
    subdomain,
  });
  if (!result.success) {
    const first = result.error.errors[0];
    console.log(result.error);
    return { error: first.message };
  }

  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }

  try {
    const app = await isUserBelongsTheApp(subdomain, session);
    if (!app) {
      throw new Error("Team not found for subdomain: " + subdomain);
    }
    await prisma.essential.create({
      data: {
        title,
        price,
        status,
        quantity,
        creator: {
          connect: { id: session.user.id },
        },
        app: {
          connect: { id: app.id },
        },
      },
    });
    revalidatePath(`/s/${subdomain}/essentials`);
    return { message: { isSuccess: true } };
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
    const essentials = await prisma.essential.findMany({
      where: {
        appId: app.id,
        // creatorId: session.user.id,
      },
      include: {
        creator: {
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
        name: item.creator.name ?? "",
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
    await prisma.essential.update({
      where: { id },
      data: {
        title,
        price,
        quantity,
        creator: {
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
  try {
    await prisma.essential.update({
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
    await prisma.essential.delete({
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

export async function getEssentialCount(subdomain: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }
  const app = await isUserBelongsTheApp(subdomain, session);
  if (!app) {
    throw new Error("Team not found for subdomain: " + subdomain);
  }
  const { _count } = await prisma.essential.aggregate({
    where: {
      appId: app.id,
      // creatorId: session.user.id,
    },
    _count: true,
  });
  return _count;
}
