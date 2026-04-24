"use server";

import { getErrorMessage } from "@/lib/error-handler";
import { revalidatePath } from "next/cache";
import { requireMembership, requireSession } from "./appActions";
import prisma from "@/lib/prisma";
import { essentialsSchema, statusUpdateSchema } from "@/lib/form-zod-schema";
import { ActionResult } from "@/lib/initial-action-return";
import { Status } from "@prisma/client";
import { getCurrentLocale } from "@/i18n/navigation";

export async function createEssentials(
  _previousState: unknown,
  formData: FormData,
) {
  const locale = await getCurrentLocale();
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
    const app = await requireMembership(subdomain);
    if (!app.appId) {
      return { error: "Team does not exist" };
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
          connect: { id: app.appId },
        },
      },
    });
    revalidatePath(`/${locale}/s/${subdomain}/essentialsBeta`);
    return { message: { isSuccess: true } };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getEssentialsBySubdomain(subdomain: string) {
  try {
    const app = await requireMembership(subdomain);
    const essentials = await prisma.essential.findMany({
      where: {
        appId: app.appId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
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
        id: item.creator?.id ?? "",
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
  formData: FormData,
): Promise<ActionResult> {
  const locale = await getCurrentLocale();
  const result = essentialsSchema.safeParse({
    title: formData.get("title"),
    price: formData.get("price"),
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
  const membership = await requireMembership(subdomain);
  try {
    const result = await prisma.essential.updateMany({
      where: { id, appId: membership.appId },
      data: {
        title,
        price,
        status,
        quantity,
      },
    });
    if (result.count === 0) {
      return { ok: false, message: "Item not found for this app." };
    }
    revalidatePath(`/${locale}/s/${subdomain}/essentials`);
    return { ok: true, message: "Ok!" };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateStatusEssentials(
  _prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const result = statusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    subdomain: formData.get("subdomain"),
  });

  if (!result.success) {
    const first = result.error.errors[0];
    return { ok: false, message: first.message };
  }
  const { id, status, subdomain } = result.data;
  const locale = await getCurrentLocale();
  const membership = await requireMembership(subdomain);
  try {
    const result = await prisma.essential.updateMany({
      where: { id, appId: membership.appId },
      data: { status },
    });
    if (result.count === 0) {
      return { ok: false, message: "Item not found for this app." };
    }
    revalidatePath(`/${locale}/s/${subdomain}/essentials`);
    return {
      ok: true,
      message: "Ok!",
    };
  } catch {
    return { ok: false, message: "Somthing went wrong" };
  }
}

export async function deleteEssentials(
  _previusState: unknown,
  id: string,
  subdomain: string,
): Promise<{ status: "success" | "error"; message: string }> {
  const locale = await getCurrentLocale();
  const membership = await requireMembership(subdomain);
  try {
    const result = await prisma.essential.deleteMany({
      where: { id, appId: membership.appId },
    });
    if (result.count === 0) {
      return { status: "error", message: "Item not found for this app." };
    }
    revalidatePath(`/${locale}/s/${subdomain}/essentials`);
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
  const membership = await requireMembership(subdomain);
  try {
    const result = await prisma.essential.updateMany({
      where: { id: essentialId, appId: membership.appId },
      data: { status },
    });
    if (result.count === 0) {
      throw new Error("Item not found for this app.");
    }
    revalidatePath(`/s/${subdomain}/essentials`);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getRecentEssentialItems(subdomain: string) {
  const { appId } = await requireMembership(subdomain);
  const essentials = await prisma.essential.findMany({
    where: {
      appId: appId,
      status: "PENDING",
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });
  return essentials.map((item) => ({
    id: item.id,
    status: item.status,
    title: item.title,
    price: item.price.toNumber(),
    quantity: item.quantity,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}
