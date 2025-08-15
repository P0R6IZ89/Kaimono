"use server";

import { auth } from "@/auth";
import { AuthError } from "next-auth";
import { isUserBelongsTheApp } from "./appActions";
import prisma from "@/lib/prisma";
import { plannedSchema } from "@/util/form-zod-schema";
import { revalidatePath } from "next/cache";

export async function createPlannedAction(
  previousState: unknown,
  formData: FormData
) {
  const result = plannedSchema.safeParse({
    title: formData.get("title"),
    price: formData.get("price"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    productUrl: formData.get("productUrl"),
    description: formData.get("description"),
    subdomain: formData.get("subdomain"),
    image: formData.get("image"),
  });

  if (!result.success) {
    const first = result.error.errors[0];
    return { error: first.message };
  }

  const data = result.data;

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const app = await prisma.app.findUnique({
    where: { subdomain: data.subdomain },
  });
  if (!app) throw new Error("App not found for subdomain: " + data.subdomain);

  try {
    await prisma.planned.create({
      data: {
        title: data.title,
        price: data.price,
        priority: data.priority,
        status: data.status,
        image: data.image,
        productUrl: data.productUrl,
        description: data.description,
        appId: app.id,
        creatorId: session.user.id,
      },
    });
    revalidatePath(`/s/${data.subdomain}/planned`);
    return { message: { isSuccess: true } };
  } catch (error) {
    console.log(error);
    return { error: "Falha ao criar o item" };
  }
}

export async function getPlannedBySubdomain(subdomain: string) {
  const session = await auth();
  if (!session || !session?.user) {
    throw new AuthError("Unauthorized user");
  }
  const app = await isUserBelongsTheApp(subdomain, session);
  if (!app) {
    throw new Error("Team not found for subdomain: " + subdomain);
  }
  try {
    const planneds = await prisma.planned.findMany({
      where: {
        appId: app.id,
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
      price: item.price ? item.price.toNumber() : null,
      status: item.status,
      priority: item.priority,
      productUrl: item.productUrl,
      description: item.description,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      appId: item.appId,
      // Likes
      likedByMe: item.likes.length > 0 ? item.likes[0].liked : false,
      likesCount: item._count.likes,
      // User
      userEmail: item.creator?.email ?? null,
      username: item.creator?.name ?? null,
      userImage: item.creator.image ?? null,
      // Comments
      commentsCount: item._count.comments,
      comments: item.comments.map((c) => ({
        id: c.id,
        authorImage: c.author.image,
        authorName: c.author.name,
        authorEmail: c.author.email,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getPlannedCount(subdomain: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }
  console.debug("getPlannedCount called with:", { subdomain, session });

  const app = await isUserBelongsTheApp(subdomain, session);
  if (!app) {
    throw new Error("Team not found for subdomain: " + subdomain);
  }
  const { _count } = await prisma.planned.aggregate({
    where: {
      appId: app.id,
      status: "pending",
    },
    _count: true,
  });
  return _count;
}

export async function completeTask(id: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }
  try {
    await prisma.planned.update({
      where: { id: id },
      data: { status: "complete" },
    });
    revalidatePath("/planned");
    return { message: { isSuccess: true } };
  } catch (error) {
    console.log(error);
    return { error: "Falha ao atualizar o item" };
  }
}
export async function revertTask(id: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }
  try {
    await prisma.planned.update({
      where: { id: id },
      data: { status: "pending" },
    });
    revalidatePath("/planned");
    return { message: { isSuccess: true } };
  } catch (error) {
    console.log(error);
    return { error: "Falha ao atualizar o item" };
  }
}

export async function deleteTask(id: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }
  try {
    await prisma.planned.delete({
      where: { id: id },
    });
    revalidatePath("/planned");
    return { message: { isSuccess: true } };
  } catch (error) {
    console.log(error);
    return { error: "Falha ao deletar o item" };
  }
}
