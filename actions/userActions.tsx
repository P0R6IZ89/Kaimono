import { auth } from "@/auth";
import { getErrorMessage } from "@/util/error-handler";
import { redirect } from "next/navigation";
import { isUserBelongsTheApp } from "./appActions";
import prisma from "@/lib/prisma";

export async function getAllUserOfApp(subdomain: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }
  try {
    const app = await isUserBelongsTheApp(subdomain, session);
    const users = await prisma.user.findMany({
      where: {
        apps: {
          some: {
            id: app.id,
          },
        },
      },
      select: {
        name: true,
        image: true,
        email: true,
      },
    });
    if (!users || users.length === 0) {
      redirect("/new-app");
    }
    return users;
  } catch (error: unknown) {
    console.error("[getAllUserOfApp] unexpected error:", error);
    throw new Error(getErrorMessage(error));
  }
}
