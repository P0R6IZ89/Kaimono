import prisma from "@/lib/prisma";

const DEMO_PLANNED_IMAGES = {
  ergonomicChair:
    "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965808/to-buy-pj/demo-planned-items/ergonomic-chair.jpg",
  monitorLightBar:
    "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965808/to-buy-pj/demo-planned-items/monitor-light-bar.jpg",
  storageBaskets:
    "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965809/to-buy-pj/demo-planned-items/storage-baskets.jpg",
  airPurifierFilter:
    "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965810/to-buy-pj/demo-planned-items/air-purifier-filter.jpg",
  usbCHub:
    "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965812/to-buy-pj/demo-planned-items/usb-c-hub.jpg",
  reusableWaterBottle:
    "https://res.cloudinary.com/dsttcre2h/image/upload/v1779965813/to-buy-pj/demo-planned-items/reusable-water-bottle.jpg",
} as const;

type DemoSeedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
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

export async function createDemoTeamForUser(user: DemoSeedUser): Promise<void> {
  if (!user.id) return;

  const subdomain = getDemoSubdomain(user);

  await prisma.$transaction(async (tx) => {
    const app = await tx.app.upsert({
      where: { subdomain },
      update: {},
      create: {
        name: "Demo Workspace",
        description:
          "Starter workspace with sample shopping lists, planned purchases, and projects.",
        subdomain,
      },
      select: { id: true },
    });

    await tx.membership.upsert({
      where: { appId_userId: { appId: app.id, userId: user.id } },
      update: { role: "OWNER" },
      create: { appId: app.id, userId: user.id, role: "OWNER" },
    });

    const [projectCount, plannedCount, essentialCount] = await Promise.all([
      tx.project.count({ where: { appId: app.id } }),
      tx.planned.count({ where: { appId: app.id } }),
      tx.essential.count({ where: { appId: app.id } }),
    ]);

    if (projectCount > 0 || plannedCount > 0 || essentialCount > 0) {
      return;
    }

    const homeRefreshProject = await tx.project.create({
      data: {
        name: "Home Refresh",
        description:
          "Furniture and household upgrades to compare before buying.",
        budget: "15000",
        appId: app.id,
        creatorId: user.id,
      },
      select: { id: true },
    });

    const deskSetupProject = await tx.project.create({
      data: {
        name: "Desk Setup",
        description: "Workstation items grouped into one buying plan.",
        budget: "50000",
        appId: app.id,
        creatorId: user.id,
      },
      select: { id: true },
    });

    await tx.essential.createMany({
      data: [
        {
          title: "Rice",
          price: "1800",
          quantity: 1,
          status: "PENDING",
          appId: app.id,
          creatorId: user.id,
        },
        {
          title: "Coffee beans",
          price: "1200",
          quantity: 2,
          status: "PENDING",
          appId: app.id,
          creatorId: user.id,
        },
        {
          title: "Laundry detergent",
          price: "850",
          quantity: 1,
          status: "PURCHASED",
          appId: app.id,
          creatorId: user.id,
        },
      ],
    });

    await tx.planned.createMany({
      data: [
        {
          title: "Ergonomic chair",
          price: "32000",
          quantity: 1,
          priority: "HIGH",
          status: "PENDING",
          image: DEMO_PLANNED_IMAGES.ergonomicChair,
          productUrl: "https://example.com/ergonomic-chair",
          description: "Compare lumbar support and delivery options.",
          appId: app.id,
          creatorId: user.id,
          projectId: deskSetupProject.id,
          projectAppId: app.id,
        },
        {
          title: "Monitor light bar",
          price: "6800",
          quantity: 1,
          priority: "MEDIUM",
          status: "PENDING",
          image: DEMO_PLANNED_IMAGES.monitorLightBar,
          productUrl: "https://example.com/monitor-light-bar",
          description: "Check desk depth and monitor compatibility.",
          appId: app.id,
          creatorId: user.id,
          projectId: deskSetupProject.id,
          projectAppId: app.id,
        },
        {
          title: "Storage baskets",
          price: "2400",
          quantity: 3,
          priority: "LOW",
          status: "PENDING",
          image: DEMO_PLANNED_IMAGES.storageBaskets,
          description: "For closet and pantry organization.",
          appId: app.id,
          creatorId: user.id,
          projectId: homeRefreshProject.id,
          projectAppId: app.id,
        },
        {
          title: "Air purifier filter",
          price: "5200",
          quantity: 1,
          priority: "URGENT",
          status: "PENDING",
          image: DEMO_PLANNED_IMAGES.airPurifierFilter,
          description: "Replacement filter before the next cleaning cycle.",
          appId: app.id,
          creatorId: user.id,
          projectId: homeRefreshProject.id,
          projectAppId: app.id,
        },
        {
          title: "USB-C hub",
          price: "4500",
          quantity: 1,
          priority: "MEDIUM",
          status: "PURCHASED",
          image: DEMO_PLANNED_IMAGES.usbCHub,
          appId: app.id,
          creatorId: user.id,
          projectId: deskSetupProject.id,
          projectAppId: app.id,
        },
        {
          title: "Reusable water bottle",
          price: "1900",
          quantity: 1,
          priority: "LOW",
          status: "CANCELLED",
          image: DEMO_PLANNED_IMAGES.reusableWaterBottle,
          description: "Kept as an example of a cancelled planned item.",
          appId: app.id,
          creatorId: user.id,
        },
      ],
    });
  });
}
