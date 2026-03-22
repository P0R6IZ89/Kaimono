import { auth } from "@/auth";
import { requireMembership, requireSession } from "./appActions";
import prisma from "@/lib/prisma";
import generatedPrisma from "@/lib/generated-prisma";

export type CurrentUserCapabilities = {
  id: string;
  isBetaTester: boolean;
  isProUser: boolean;
  canUseAiProductExtraction: boolean;
};

export async function getCurrentUserCapabilities(): Promise<CurrentUserCapabilities | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const user = await generatedPrisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      isBetaTester: true,
      isProUser: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,
    canUseAiProductExtraction: user.isBetaTester && user.isProUser,
  };
}

export async function getAllUserOfApp(subdomain: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }

  const app = await requireMembership(subdomain);
  const users = await prisma.user.findMany({
    where: { memberships: { some: { appId: app.appId } } },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });
  return users;
}

export async function getTenFirstUsersOfApp(subdomain: string) {
  const limit = 10;
  await requireSession();
  const app = await requireMembership(subdomain);
  const [totalCount, users] = await prisma.$transaction([
    prisma.user.count({
      where: { memberships: { some: { appId: app.appId } } },
    }),
    prisma.user.findMany({
      where: { memberships: { some: { appId: app.appId } } },
      select: { id: true, name: true, email: true, image: true },
      orderBy: { createdAt: "asc" },
      take: limit,
    }),
  ]);

  return {
    totalCount,
    users,
    hasMore: totalCount > limit,
    overflowCount: Math.max(0, totalCount - limit),
  };
}
