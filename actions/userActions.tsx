import { auth } from "@/auth";
import { isUserBelongsTheApp } from "./appActions";
import prisma from "@/lib/prisma";

export async function getAllUserOfApp(subdomain: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }
  console.debug("getAllUserOfApp called with:", { subdomain, session });

  const app = await isUserBelongsTheApp(subdomain);
  const users = await prisma.user.findMany({
    where: { memberships: { some: { appId: app.id } } },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });
  return users;
}
