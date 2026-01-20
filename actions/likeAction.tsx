"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSession } from "./appActions";

type ToggleLikeResult = { liked: boolean };

export async function toggleLikeAction(
  plannedId: string,
): Promise<ToggleLikeResult> {
  const session = await requireSession();
  const planned = await prisma.planned.findUnique({
    where: {
      id: plannedId,
    },
    select: {
      appId: true,
      app: {
        select: { subdomain: true },
      },
    },
  });
  if (!planned?.app?.subdomain) {
    throw new Error("Planned item not found.");
  }
  const membership = await prisma.membership.findUnique({
    where: { appId_userId: { appId: planned.appId, userId: session.user.id } },
  });
  if (!membership) {
    throw new Error("Planned item not found.");
  }
  const existing = await prisma.plannedLike.findUnique({
    where: { creatorId_plannedId: { creatorId: session.user.id, plannedId } },
  });
  let liked: boolean;
  if (!existing) {
    await prisma.plannedLike.create({
      data: { creatorId: session.user.id, plannedId, liked: true },
    });
    liked = true;
  } else {
    liked = !existing.liked;
    await prisma.plannedLike.update({
      where: { id: existing.id },
      data: { liked },
    });
  }
  revalidatePath(`/s/${planned.app.subdomain}/planned`);
  return { liked };
}
