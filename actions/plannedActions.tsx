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
  const title = formData.get("title")?.toString() as string;
  const priceString = formData.get("price")?.toString() as string;
  const priority = formData.get("priority")?.toString() as string;
  const status = formData.get("status")?.toString() as string;
  const productUrl = formData.get("productUrl")?.toString() as string;
  const description = formData.get("description")?.toString() as string;
  const subdomain = formData.get("subdomain")?.toString() as string;
  const image = formData.get("image")?.toString() as string;
  const price = parseFloat(priceString);

  const result = plannedSchema.safeParse({
    title,
    price,
    priority,
    status,
    productUrl,
    description,
    subdomain,
    image,
  });

  if (!result.success) {
    const first = result.error.errors[0];
    console.log(result.error);
    return { error: first.message };
  }

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const app = await prisma.app.findUnique({ where: { subdomain } });
  if (!app) throw new Error("App not found for subdomain: " + subdomain);

  try {
    await prisma.planned.create({
      data: {
        title,
        price,
        priority,
        status,
        image,
        productUrl,
        description,
        appId: app.id,
        creatorId: session.user.id,
      },
    });
    revalidatePath(`/s/${subdomain}/planned`);
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
  const app = await isUserBelongsTheApp(subdomain, session);
  if (!app) {
    throw new Error("Team not found for subdomain: " + subdomain);
  }
  const { _count } = await prisma.planned.aggregate({
    where: {
      appId: app.id,
      // creatorId: session.user.id,
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
