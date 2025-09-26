"use server";

import prisma from "@/lib/prisma";
import { requireSession } from "./appActions";

export async function getMyInvitationsAction() {
  const session = await requireSession();
  const invitedApp = await prisma.invitation.findMany({
    where: { email: session.user.email },
    select: {
      app: { select: { id: true, name: true, subdomain: true } },
      id: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return invitedApp;
}
