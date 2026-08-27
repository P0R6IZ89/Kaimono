import {
  DEMO_PLANNED_IMAGES,
  DEMO_WORKSPACE_FIXTURE,
  type DemoImageSource,
  type DemoProjectKey,
} from "@/lib/demo-fixtures";
import prisma from "@/lib/prisma";
import type { Prisma, Role } from "@/prisma/generated/prisma";

type DemoSeedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export type DemoWorkspaceSeedInput = {
  userId: string;
  subdomain: string;
  role?: Role;
  imageSource?: DemoImageSource;
  workspaceMode?: "create" | "upsert";
};

export type DemoWorkspaceSeedResult = {
  appId: string;
  subdomain: string;
  seeded: boolean;
};

function normalizeSubdomain(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getUserSlug(user: DemoSeedUser) {
  const source = user.email?.split("@")[0] || user.name || "user";
  return normalizeSubdomain(source) || "user";
}

function getDemoSubdomain(user: DemoSeedUser) {
  const suffix = normalizeSubdomain(user.id).slice(-8) || "demo";
  return normalizeSubdomain(`demo-${getUserSlug(user)}-${suffix}`);
}

export async function seedDemoWorkspace(
  tx: Prisma.TransactionClient,
  {
    userId,
    subdomain,
    role = "OWNER",
    imageSource = "cloudinary",
    workspaceMode = "upsert",
  }: DemoWorkspaceSeedInput,
): Promise<DemoWorkspaceSeedResult> {
  const appData = {
    name: DEMO_WORKSPACE_FIXTURE.name,
    description: DEMO_WORKSPACE_FIXTURE.description,
    subdomain,
  };

  const app =
    workspaceMode === "create"
      ? await tx.app.create({
          data: appData,
          select: { id: true },
        })
      : await tx.app.upsert({
          where: { subdomain },
          update: {},
          create: appData,
          select: { id: true },
        });

  await tx.membership.upsert({
    where: { appId_userId: { appId: app.id, userId } },
    update: { role },
    create: { appId: app.id, userId, role },
  });

  const [projectCount, plannedCount, essentialCount] = await Promise.all([
    tx.project.count({ where: { appId: app.id } }),
    tx.planned.count({ where: { appId: app.id } }),
    tx.essential.count({ where: { appId: app.id } }),
  ]);

  if (projectCount > 0 || plannedCount > 0 || essentialCount > 0) {
    return { appId: app.id, subdomain, seeded: false };
  }

  const projectIds = {} as Record<DemoProjectKey, string>;

  for (const project of DEMO_WORKSPACE_FIXTURE.projects) {
    const createdProject = await tx.project.create({
      data: {
        name: project.name,
        description: project.description,
        budget: project.budget,
        appId: app.id,
        creatorId: userId,
      },
      select: { id: true },
    });

    projectIds[project.key] = createdProject.id;
  }

  await tx.essential.createMany({
    data: DEMO_WORKSPACE_FIXTURE.essentials.map((essential) => ({
      ...essential,
      appId: app.id,
      creatorId: userId,
    })),
  });

  await tx.planned.createMany({
    data: DEMO_WORKSPACE_FIXTURE.planned.map((planned) => {
      const projectId =
        "projectKey" in planned ? projectIds[planned.projectKey] : undefined;

      return {
        title: planned.title,
        price: planned.price,
        quantity: planned.quantity,
        priority: planned.priority,
        status: planned.status,
        image: DEMO_PLANNED_IMAGES[imageSource][planned.imageKey],
        productUrl: "productUrl" in planned ? planned.productUrl : undefined,
        description: "description" in planned ? planned.description : undefined,
        appId: app.id,
        creatorId: userId,
        projectId,
        projectAppId: projectId ? app.id : undefined,
      };
    }),
  });

  return { appId: app.id, subdomain, seeded: true };
}

export async function createDemoTeamForUser(user: DemoSeedUser): Promise<void> {
  if (!user.id) return;

  await prisma.$transaction(async (tx) => {
    await seedDemoWorkspace(tx, {
      userId: user.id,
      subdomain: getDemoSubdomain(user),
    });
  });
}
