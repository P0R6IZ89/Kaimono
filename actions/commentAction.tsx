"use server";

import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/util/error-handler";
import { plannedCommentSchema } from "@/util/form-zod-schema";
import { revalidatePath } from "next/cache";
import { requireSession } from "./appActions";

async function ensurePlannedAccess(
  plannedId: string,
  userId: string
): Promise<{ subdomain: string | null; authorId: string | null }> {
  const planned = await prisma.planned.findUnique({
    where: { id: plannedId },
    select: {
      appId: true,
      creatorId: true,
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

  return {
    subdomain: planned.app?.subdomain ?? null,
    authorId: planned.creatorId ?? null,
  };
}

export async function createCommentAction(
  prevState: unknown,
  formData: FormData
) {
  const session = await requireSession();
  const content = formData.get("content")?.toString() as string;
  const plannedId = formData.get("id")?.toString() as string;

  const { subdomain } = await ensurePlannedAccess(plannedId, session.user.id);
  const result = plannedCommentSchema.safeParse({
    content,
    author: session.user.id,
    planned: plannedId,
  });
  if (!result.success) {
    return { ok: false, error: result.error.errors[0].message };
  }

  await prisma.plannedComment.create({
    data: {
      content,
      author: { connect: { id: session.user.id } },
      planned: { connect: { id: plannedId } },
    },
  });
  if (subdomain) {
    revalidatePath(`/s/${subdomain}/planned`);
  }
  return { ok: true, error: "" };
}

export async function deleteComment(id: string) {
  const session = await requireSession();
  const comment = await prisma.plannedComment.findUnique({
    where: { id },
    select: {
      authorId: true,
      planned: {
        select: { appId: true, app: { select: { subdomain: true } } },
      },
    },
  });

  if (!comment) {
    throw new Error("Comment not found.");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      appId_userId: {
        appId: comment.planned.appId,
        userId: session.user.id,
      },
    },
    select: { role: true },
  });

  if (!membership) {
    throw new Error("You do not have permission to delete this comment.");
  }

  const isAuthor = comment.authorId === session.user.id;
  const isPrivileged =
    membership.role === "OWNER" || membership.role === "ADMIN";

  if (!isAuthor && !isPrivileged) {
    throw new Error(
      "Only the comment author or an app admin can delete comments."
    );
  }

  await prisma.plannedComment.delete({
    where: { id },
  });
  if (comment.planned.app?.subdomain) {
    revalidatePath(`/s/${comment.planned.app.subdomain}/planned`);
  }
}
