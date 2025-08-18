"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/util/error-handler";
import { plannedCommentSchema } from "@/util/form-zod-schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCommentAction(
  prevState: unknown,
  formData: FormData
) {
  const session = await auth();
  const content = formData.get("content")?.toString() as string;
  const plannedId = formData.get("id")?.toString() as string;
  if (!session?.user) {
    redirect("/login");
  }
  const result = plannedCommentSchema.safeParse({
    content,
    author: session.user.id,
    planned: plannedId,
  });
  if (!result.success) {
    return { ok: false, error: result.error.errors[0].message };
  }
  try {
    await prisma.plannedComment.create({
      data: {
        content,
        author: { connect: { id: session.user.id } },
        planned: { connect: { id: plannedId } },
      },
    });
    revalidatePath("/planned");
    return { ok: true, error: "" };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteComment(id: string) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  await prisma.plannedComment.delete({
    where: { id },
  });
  revalidatePath("/planned");
}
