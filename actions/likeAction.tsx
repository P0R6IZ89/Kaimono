"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ToggleLikeResult = { liked: boolean };

export async function toggleLikeAction(
  plannedId: string
): Promise<ToggleLikeResult> {
  const session = await auth();
  if (!session?.user || !session.user.id) redirect("/login");
  const creatorId: string = session.user.id;
  const existing = await prisma.plannedLike.findUnique({
    where: { creatorId_plannedId: { creatorId, plannedId } },
  });
  let liked: boolean;
  if (!existing) {
    await prisma.plannedLike.create({
      data: { creatorId, plannedId, liked: true },
    });
    liked = true;
  } else {
    liked = !existing.liked;
    await prisma.plannedLike.update({
      where: { id: existing.id },
      data: { liked },
    });
  }
  revalidatePath("/planned");
  return { liked };
}
