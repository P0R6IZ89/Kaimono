"use server";

import { auth } from "@/auth";
import {
  isUserBelongsTheApp,
  requireMembership,
  requireSession,
} from "./appActions";
import prisma from "@/lib/prisma";
import { plannedSchema } from "@/util/form-zod-schema";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/util/error-handler";
import { ActionResult } from "@/util/initial-action-return";

async function requirePlannedAccess(
  plannedId: string,
  userId: string
): Promise<{ appId: string; subdomain: string | null }> {
  const planned = await prisma.planned.findUnique({
    where: { id: plannedId },
    select: {
      appId: true,
      app: { select: { subdomain: true } },
    },
  });

  if (!planned) {
    throw new Error("Planned item not found.");
  }

  const membership = await prisma.membership.findUnique({
    where: { appId_userId: { appId: planned.appId, userId } },
    select: { role: true },
  });

  if (!membership) {
    throw new Error("You do not have access to this item.");
  }

  return { appId: planned.appId, subdomain: planned.app?.subdomain ?? null };
}

export async function createPlannedAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const result = plannedSchema.safeParse({
    title: formData.get("title"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    productUrl: formData.get("productUrl"),
    description: formData.get("description"),
    subdomain: formData.get("subdomain"),
    image: formData.get("image"),
  });

  if (!result.success) {
    const first = result.error.errors[0];
    return { ok: false, message: first.message };
  }

  const data = result.data;
  const { appId, session } = await requireMembership(data.subdomain);

  try {
    await prisma.planned.create({
      data: {
        title: data.title,
        price: data.price,
        quantity: data.quantity,
        priority: data.priority,
        status: data.status,
        image: data.image,
        productUrl: data.productUrl,
        description: data.description,
        appId,
        creatorId: session.user.id,
      },
    });
    revalidatePath(`/s/${data.subdomain}/planned`);
    return { ok: true, message: "Item criado com sucesso!" };
  } catch {
    return { ok: false, message: "Falha ao criar o item" };
  }
}

export async function updatePlanned(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const result = plannedSchema.safeParse({
    title: formData.get("title"),
    price: formData.get("price"),
    status: formData.get("status"),
    quantity: formData.get("quantity"),
    priority: formData.get("priority"),
    productUrl: formData.get("productUrl"),
    description: formData.get("description"),
    subdomain: formData.get("subdomain"),
    image: formData.get("image"),
  });

  if (!result.success) {
    const first = result.error.errors[0];
    return { ok: false, message: first.message };
  }

  const data = result.data;

  await requireSession();
  const membership = await requireMembership(data.subdomain);
  const plannedId = formData.get("id") as string;

  const belongsToApp = await prisma.planned.findFirst({
    where: { id: plannedId, appId: membership.appId },
    select: { id: true },
  });

  if (!belongsToApp) {
    return { ok: false, message: "Item not found for this app." };
  }

  try {
    await prisma.planned.update({
      where: { id: plannedId },
      data: {
        title: data.title,
        price: data.price,
        status: data.status,
        quantity: data.quantity,
        priority: data.priority,
        productUrl: data.productUrl,
        description: data.description,
        image: data.image,
      },
    });
    revalidatePath(`/s/${data.subdomain}/planned`);
    return { ok: true, message: "Item updated successfully" };
  } catch (error: unknown) {
    return {
      ok: false,
      message: "Failed to update item: " + getErrorMessage(error),
    };
  }
}

export async function getPlannedBySubdomain(subdomain: string) {
  const app = await requireMembership(subdomain);
  const session = await requireSession();
  try {
    const planneds = await prisma.planned.findMany({
      where: {
        appId: app.appId,
      },
      include: {
        creator: {
          select: { name: true, email: true, image: true },
        },
        _count: {
          select: {
            likes: {
              where: {
                liked: true,
              },
            },
            comments: true,
          },
        },
        likes: {
          where: { creatorId: session.user.id },
          select: { liked: true },
        },

        comments: {
          orderBy: { createdAt: "desc" },
          take: 25,
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { image: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return planneds.map((item) => ({
      id: item.id,
      image: item.image,
      title: item.title,
      price: item.price ? item.price.toNumber() : 0,
      quantity: item.quantity,
      status: item.status,
      priority: item.priority,
      productUrl: item.productUrl,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      appId: item.appId,
      likedByMe: item.likes.length > 0 ? item.likes[0].liked : false,
      likesCount: item._count.likes,
      userEmail: item.creator?.email ?? "",
      username: item.creator?.name ?? "",
      userImage: item.creator?.image ?? "",
      commentsCount: item._count.comments,
      comments: item.comments.map((c) => ({
        id: c.id,
        authorImage: c.author?.image,
        authorName: c.author?.name,
        authorEmail: c.author?.email,
        content: c.content,
        createdAt: c.createdAt,
      })),
    }));
  } catch {
    return [];
  }
}

export async function getPlannedCount(subdomain: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }

  const app = await isUserBelongsTheApp(subdomain);
  if (!app) {
    throw new Error("Team not found for subdomain: " + subdomain);
  }
  const { _count } = await prisma.planned.aggregate({
    where: {
      appId: app.id,
      status: "PENDING",
    },
    _count: true,
  });
  return _count;
}

export async function completeTask(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }

  const { appId, subdomain } = await requirePlannedAccess(id, session.user.id);
  try {
    const result = await prisma.planned.updateMany({
      where: { id, appId },
      data: { status: "PURCHASED" },
    });
    if (result.count === 0) {
      return { ok: false, message: "Item not found for this app." };
    }
    if (subdomain) {
      revalidatePath(`/s/${subdomain}/planned`);
    }
    return { ok: true, message: "Item atualizado com sucesso" };
  } catch {
    return { ok: false, message: "Falha ao atualizar o item" };
  }
}
export async function revertTask(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }

  const { appId, subdomain } = await requirePlannedAccess(id, session.user.id);
  try {
    const result = await prisma.planned.updateMany({
      where: { id, appId },
      data: { status: "PENDING" },
    });
    if (result.count === 0) {
      return { ok: false, message: "Item not found for this app." };
    }
    if (subdomain) {
      revalidatePath(`/s/${subdomain}/planned`);
    }
    return { ok: true, message: "Item atualizado com sucesso" };
  } catch {
    return { ok: false, message: "Falha ao atualizar o item" };
  }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }

  const { appId, subdomain } = await requirePlannedAccess(id, session.user.id);
  try {
    const result = await prisma.planned.deleteMany({
      where: { id, appId },
    });
    if (result.count === 0) {
      return { ok: false, message: "Item not found for this app." };
    }
    if (subdomain) {
      revalidatePath(`/s/${subdomain}/planned`);
    }
    return { ok: true, message: "Item deletado com sucesso" };
  } catch {
    return { ok: false, message: "Falha ao deletar o item" };
  }
}
