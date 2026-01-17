"use server";

import { getErrorMessage } from "@/util/error-handler";
import { revalidatePath } from "next/cache";
import {
  isUserBelongsTheApp,
  requireMembership,
  requireSession,
} from "./appActions";
import prisma from "@/lib/prisma";
import { essentialsSchema, statusUpdateSchema } from "@/util/form-zod-schema";
import { Status } from "@prisma/client";

export async function createEssentials(
  _previousState: unknown,
  formData: FormData
) {
  const result = essentialsSchema.safeParse({
    title: formData.get("title"),
    status: "PENDING",
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    subdomain: formData.get("subdomain"),
  });
  if (!result.success) {
    const first = result.error.errors[0];
    return { error: first.message };
  }
  const { title, price, quantity, status, subdomain } = result.data;
  const session = await requireSession();
  try {
    const app = await isUserBelongsTheApp(subdomain);
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
  await requireSession();
  try {
    const app = await isUserBelongsTheApp(subdomain);
    const essentials = await prisma.essential.findMany({
      where: {
        appId: app.id,
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
        name: item.creator?.name ?? "",
      },
    }));
    return formatted;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateEssentials(
  _prevState: unknown,
  formData: FormData
) {
  const result = essentialsSchema.safeParse({
    title: formData.get("title"),
    price: formData.get("quantity"),
    status: formData.get("status"),
    quantity: formData.get("quantity"),
    subdomain: formData.get("subdomain"),
    id: formData.get("id"),
  });

  if (!result.success) {
    const first = result.error.errors[0];
    return { ok: false, message: first.message };
  }
  const { price, quantity, subdomain, title, id, status } = result.data;
  const session = await requireSession();
  try {
    const app = await isUserBelongsTheApp(subdomain);
    if (!app) {
      throw new Error("Team not found for subdomain: " + subdomain);
    }
    await prisma.essential.update({
      where: { id },
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
    return { ok: true, message: "O item foi atualizado com sucesso" };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateStatusEssentials(
  _prevState: unknown,
  formData: FormData
) {
  const result = statusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!result.success) {
    const first = result.error.errors[0];
    return { ok: false, message: first.message };
  }
  const { id, status } = result.data;
  await requireSession();
  try {
    await prisma.essential.update({
      where: { id },
      data: { status },
    });
    revalidatePath(`/s`);
    return {
      ok: true,
      message: "O item foi atualizado com sucesso!",
    };
  } catch {
    return { ok: false, message: "O item não pode ser atualizado!" };
  }
}

export async function deleteEssentials(
  _previusState: unknown,
  id: string,
  subdomain: string
): Promise<{ status: "success" | "error"; message: string }> {
  await requireSession();
  await requireMembership(subdomain);
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
  await requireSession();
  const { appId } = await requireMembership(subdomain);
  const { _count } = await prisma.essential.aggregate({
    where: {
      appId: appId,
      status: "PENDING",
    },
    _count: true,
  });
  return _count;
}

export async function getEssentialsPendingTotalExpense(subdomain: string) {
  await requireSession();
  const { appId } = await requireMembership(subdomain);
  const essentials = await prisma.essential.findMany({
    where: {
      appId: appId,
      status: "PENDING",
    },
    select: {
      price: true,
      quantity: true,
    },
  });
  const totalExpense = essentials.reduce((acc, item) => {
    return acc + item.price.toNumber() * item.quantity;
  }, 0);
  return totalExpense;
}

export async function setEssentialStatusAction({
  essentialId,
  status,
  subdomain,
}: {
  essentialId: string;
  status: Extract<Status, "PENDING" | "PURCHASED">;
  subdomain: string;
}) {
  await requireSession();
  await requireMembership(subdomain);
  try {
    await prisma.essential.update({
      where: { id: essentialId },
      data: { status },
    });
    revalidatePath(`/s`);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}
