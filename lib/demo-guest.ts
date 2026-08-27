import "server-only";

import { randomUUID } from "node:crypto";
import { seedDemoWorkspace } from "@/lib/demo-team-seed";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma";

const DEMO_GUEST_TTL_MS = 60 * 60 * 1000;
const DEMO_CREATE_ATTEMPTS = 3;
const DEFAULT_CLEANUP_BATCH_SIZE = 100;
const MAX_CLEANUP_BATCH_SIZE = 100;

export type DemoGuestErrorCode =
  "DEMO_DISABLED" | "DEMO_LEASE_INACTIVE" | "DEMO_IDENTIFIER_CONFLICT";

export class DemoGuestError extends Error {
  constructor(public readonly code: DemoGuestErrorCode) {
    super(code);
    this.name = "DemoGuestError";
  }
}

export type DemoGuestCreationResult = {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  workspace: {
    id: string;
    subdomain: string;
  };
  lease: {
    id: string;
    expiresAt: Date;
  };
};

export type ActiveDemoLease = {
  id: string;
  userId: string;
  appId: string;
  expiresAt: Date;
  subdomain: string;
};

export type DeleteDemoGuestResult = {
  deleted: boolean;
  appDeleted: boolean;
  userDeleted: boolean;
};

export type DeleteExpiredDemoGuestsResult = {
  examined: number;
  deleted: number;
  failed: number;
};

type ResolvedDemoLease = ActiveDemoLease;

function assertDemoModeEnabled(): void {
  if (process.env.DEMO_MODE_ENABLED !== "true") {
    throw new DemoGuestError("DEMO_DISABLED");
  }
}

function createDemoIdentity() {
  const id = randomUUID();
  const subdomainSuffix = id.replaceAll("-", "").slice(0, 16);

  return {
    email: `demo-${id}@guest.invalid`,
    subdomain: `demo-${subdomainSuffix}`,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function normalizeCleanupBatchSize(limit: number): number {
  if (!Number.isFinite(limit)) return DEFAULT_CLEANUP_BATCH_SIZE;

  return Math.min(Math.max(Math.trunc(limit), 1), MAX_CLEANUP_BATCH_SIZE);
}

async function getDemoLease(userId: string): Promise<ResolvedDemoLease | null> {
  const lease = await prisma.demoLease.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      appId: true,
      expiresAt: true,
      app: { select: { subdomain: true } },
    },
  });

  if (!lease) return null;

  return {
    id: lease.id,
    userId: lease.userId,
    appId: lease.appId,
    expiresAt: lease.expiresAt,
    subdomain: lease.app.subdomain,
  };
}

async function deleteResolvedDemoGuest(
  lease: ResolvedDemoLease,
): Promise<DeleteDemoGuestResult> {
  return prisma.$transaction(async (tx) => {
    const appResult = await tx.app.deleteMany({
      where: { id: lease.appId },
    });
    const userResult = await tx.user.deleteMany({
      where: { id: lease.userId },
    });

    return {
      deleted: appResult.count > 0 || userResult.count > 0,
      appDeleted: appResult.count > 0,
      userDeleted: userResult.count > 0,
    };
  });
}

export async function createDemoGuest(): Promise<DemoGuestCreationResult> {
  assertDemoModeEnabled();

  for (let attempt = 0; attempt < DEMO_CREATE_ATTEMPTS; attempt += 1) {
    const identity = createDemoIdentity();
    const expiresAt = new Date(Date.now() + DEMO_GUEST_TTL_MS);

    try {
      return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: identity.email,
            name: "Demo Guest",
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        });

        const workspace = await seedDemoWorkspace(tx, {
          userId: user.id,
          subdomain: identity.subdomain,
          role: "MEMBER",
          imageSource: "local",
          workspaceMode: "create",
        });

        const lease = await tx.demoLease.create({
          data: {
            userId: user.id,
            appId: workspace.appId,
            expiresAt,
          },
          select: {
            id: true,
            expiresAt: true,
          },
        });

        return {
          user,
          workspace: {
            id: workspace.appId,
            subdomain: workspace.subdomain,
          },
          lease,
        };
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) continue;
      throw error;
    }
  }

  throw new DemoGuestError("DEMO_IDENTIFIER_CONFLICT");
}

export async function getActiveDemoLease(
  userId: string,
): Promise<ActiveDemoLease | null> {
  const lease = await prisma.demoLease.findFirst({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      userId: true,
      appId: true,
      expiresAt: true,
      app: { select: { subdomain: true } },
    },
  });

  if (!lease) return null;

  return {
    id: lease.id,
    userId: lease.userId,
    appId: lease.appId,
    expiresAt: lease.expiresAt,
    subdomain: lease.app.subdomain,
  };
}

export async function resetDemoGuestWorkspace(
  userId: string,
): Promise<{ appId: string; subdomain: string; expiresAt: Date }> {
  assertDemoModeEnabled();

  const lease = await getActiveDemoLease(userId);
  if (!lease) {
    throw new DemoGuestError("DEMO_LEASE_INACTIVE");
  }

  return prisma.$transaction(async (tx) => {
    await tx.planned.deleteMany({ where: { appId: lease.appId } });
    await tx.project.deleteMany({ where: { appId: lease.appId } });
    await tx.essential.deleteMany({ where: { appId: lease.appId } });
    await tx.invitation.deleteMany({ where: { appId: lease.appId } });

    const workspace = await seedDemoWorkspace(tx, {
      userId: lease.userId,
      subdomain: lease.subdomain,
      role: "MEMBER",
      imageSource: "local",
    });

    return {
      appId: workspace.appId,
      subdomain: workspace.subdomain,
      expiresAt: lease.expiresAt,
    };
  });
}

export async function deleteDemoGuest(
  userId: string,
): Promise<DeleteDemoGuestResult> {
  const lease = await getDemoLease(userId);

  if (!lease) {
    return {
      deleted: false,
      appDeleted: false,
      userDeleted: false,
    };
  }

  return deleteResolvedDemoGuest(lease);
}

export async function deleteExpiredDemoGuests(
  limit = DEFAULT_CLEANUP_BATCH_SIZE,
): Promise<DeleteExpiredDemoGuestsResult> {
  const expiredLeases = await prisma.demoLease.findMany({
    where: { expiresAt: { lte: new Date() } },
    orderBy: { expiresAt: "asc" },
    take: normalizeCleanupBatchSize(limit),
    select: {
      id: true,
      userId: true,
      appId: true,
      expiresAt: true,
      app: { select: { subdomain: true } },
    },
  });

  let deleted = 0;
  let failed = 0;

  for (const lease of expiredLeases) {
    try {
      const result = await deleteResolvedDemoGuest({
        id: lease.id,
        userId: lease.userId,
        appId: lease.appId,
        expiresAt: lease.expiresAt,
        subdomain: lease.app.subdomain,
      });

      if (result.deleted) deleted += 1;
    } catch (error) {
      failed += 1;
      console.error("[demo-cleanup] Failed to delete an expired guest", {
        leaseId: lease.id,
        userId: lease.userId,
        error,
      });
    }
  }

  return {
    examined: expiredLeases.length,
    deleted,
    failed,
  };
}
