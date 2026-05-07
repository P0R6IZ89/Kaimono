import "dotenv/config";

import {
  PrismaClient,
  Priority,
  Role,
  Status,
  type Prisma,
} from "./generated/prisma";

const prisma = new PrismaClient();

const plannedPlaceholderImage =
  "https://res.cloudinary.com/dsttcre2h/image/upload/v1751870559/placeholder_dtzhrr.png";

const seedStartedAt = new Date();
const dayInMs = 24 * 60 * 60 * 1000;

function daysAgo(days: number) {
  return new Date(seedStartedAt.getTime() - days * dayInMs);
}

const guestUser = {
  email: "guest@example.com",
  name: "Guest User",
  image: "https://api.dicebear.com/9.x/initials/svg?seed=Guest%20User",
};

const apps = [
  {
    name: "Personal Expenses",
    description: "Personal day-to-day purchases and short-term wish list.",
    subdomain: "personal-expenses",
  },
  {
    name: "Family Expenses",
    description: "Shared household spending.",
    subdomain: "family-expenses",
  },
  {
    name: "Business Expenses",
    description: "Work purchases and operating costs.",
    subdomain: "business-expenses",
  },
] satisfies Prisma.AppCreateManyInput[];

type EssentialSeed = Omit<
  Prisma.EssentialCreateManyInput,
  "appId" | "creatorId" | "createdAt" | "updatedAt"
>;

const essentials = [
  { title: "Rice 5kg", price: 2480, quantity: 1, status: Status.PENDING },
  { title: "Eggs 10-pack", price: 320, quantity: 2, status: Status.PENDING },
  { title: "Milk", price: 240, quantity: 3, status: Status.PENDING },
  { title: "Coffee beans", price: 1580, quantity: 1, status: Status.PENDING },
  {
    title: "Laundry detergent",
    price: 780,
    quantity: 1,
    status: Status.PENDING,
  },
  { title: "Toilet paper", price: 960, quantity: 1, status: Status.PENDING },
  { title: "Shampoo refill", price: 690, quantity: 2, status: Status.PENDING },
  { title: "Dish soap", price: 260, quantity: 1, status: Status.PENDING },
  { title: "Trash bags", price: 480, quantity: 1, status: Status.PENDING },
  {
    title: "Train pass top-up",
    price: 5000,
    quantity: 1,
    status: Status.PENDING,
  },
  { title: "Mobile plan", price: 2980, quantity: 1, status: Status.PURCHASED },
  {
    title: "Electricity bill",
    price: 9200,
    quantity: 1,
    status: Status.PENDING,
  },
  { title: "Gas bill", price: 4100, quantity: 1, status: Status.PENDING },
  {
    title: "Internet bill",
    price: 5200,
    quantity: 1,
    status: Status.PURCHASED,
  },
  {
    title: "Breakfast cereal",
    price: 640,
    quantity: 2,
    status: Status.PENDING,
  },
  { title: "Olive oil", price: 1180, quantity: 1, status: Status.PENDING },
  { title: "Tissues", price: 540, quantity: 2, status: Status.PENDING },
  { title: "Toothpaste", price: 420, quantity: 2, status: Status.PENDING },
] satisfies EssentialSeed[];

type PlannedSeed = Omit<
  Prisma.PlannedCreateManyInput,
  | "appId"
  | "creatorId"
  | "projectId"
  | "projectAppId"
  | "createdAt"
  | "updatedAt"
>;

type ProjectSeed = {
  name: string;
  description: string;
  planned: PlannedSeed[];
};

const projects: ProjectSeed[] = [
  {
    name: "Fitness Setup",
    description: "Build a compact home workout kit.",
    planned: [
      {
        title: "Adjustable dumbbells",
        price: 24800,
        priority: Priority.HIGH,
        status: Status.PENDING,
        description: "Space-saving strength training weights.",
      },
      {
        title: "Yoga mat",
        price: 3600,
        priority: Priority.MEDIUM,
        status: Status.PURCHASED,
        description: "Non-slip mat for stretching and floor workouts.",
      },
      {
        title: "Resistance bands",
        price: 1800,
        priority: Priority.LOW,
        status: Status.PENDING,
        description: "Lightweight bands for warmups and mobility.",
      },
      {
        title: "Running shoes",
        price: 14200,
        priority: Priority.URGENT,
        status: Status.PENDING,
        description: "Replace worn daily running shoes.",
      },
      {
        title: "Fitness tracker",
        price: 19800,
        priority: Priority.MEDIUM,
        status: Status.PENDING,
        description: "Track workouts, sleep, and daily activity.",
      },
      {
        title: "Foam roller",
        price: 3200,
        priority: Priority.LOW,
        status: Status.PENDING,
        description: "Recovery tool for sore muscles.",
      },
      {
        title: "Pull-up bar",
        price: 4600,
        priority: Priority.MEDIUM,
        status: Status.CANCELLED,
        description: "Doorway bar for upper-body workouts.",
      },
    ],
  },
  {
    name: "Travel Prep",
    description: "Prepare a reliable kit for upcoming trips.",
    planned: [
      {
        title: "Carry-on suitcase",
        price: 22800,
        priority: Priority.HIGH,
        status: Status.PENDING,
        description: "Durable carry-on with spinner wheels.",
      },
      {
        title: "Packing cubes",
        price: 3400,
        priority: Priority.MEDIUM,
        status: Status.PENDING,
        description: "Organize clothes and accessories.",
      },
      {
        title: "Travel adapter",
        price: 2600,
        priority: Priority.URGENT,
        status: Status.PENDING,
        description: "Universal adapter with USB ports.",
      },
      {
        title: "Passport wallet",
        price: 4200,
        priority: Priority.MEDIUM,
        status: Status.PURCHASED,
        description: "Keep passport, cards, and tickets together.",
      },
      {
        title: "Toiletries kit",
        price: 2900,
        priority: Priority.LOW,
        status: Status.PENDING,
        description: "Hanging pouch for small bottles.",
      },
      {
        title: "Portable charger",
        price: 6800,
        priority: Priority.HIGH,
        status: Status.PENDING,
        description: "High-capacity charger for long travel days.",
      },
      {
        title: "Lightweight rain jacket",
        price: 11800,
        priority: Priority.MEDIUM,
        status: Status.PENDING,
        description: "Packable jacket for unpredictable weather.",
      },
    ],
  },
  {
    name: "Tech Wishlist",
    description: "Personal technology upgrades to compare over time.",
    planned: [
      {
        title: "Tablet",
        price: 64800,
        priority: Priority.HIGH,
        status: Status.PENDING,
        description: "Portable device for reading and sketching.",
      },
      {
        title: "Mechanical keyboard",
        price: 16800,
        priority: Priority.MEDIUM,
        status: Status.PENDING,
        description: "Quiet tactile keyboard for daily typing.",
      },
      {
        title: "Wireless mouse",
        price: 6200,
        priority: Priority.MEDIUM,
        status: Status.PURCHASED,
        description: "Ergonomic mouse for the home office.",
      },
      {
        title: "External SSD",
        price: 15800,
        priority: Priority.HIGH,
        status: Status.PENDING,
        description: "Portable backup drive for photos and files.",
      },
      {
        title: "Smart speaker",
        price: 8800,
        priority: Priority.LOW,
        status: Status.PENDING,
        description: "Small speaker for the kitchen counter.",
      },
      {
        title: "Webcam",
        price: 9800,
        priority: Priority.MEDIUM,
        status: Status.PENDING,
        description: "Sharper video for calls.",
      },
      {
        title: "Laptop stand",
        price: 5400,
        priority: Priority.LOW,
        status: Status.PENDING,
        description: "Raise laptop screen to eye level.",
      },
    ],
  },
  {
    name: "Apartment Comfort",
    description: "Small purchases that make the apartment easier to live in.",
    planned: [
      {
        title: "Blackout curtains",
        price: 9200,
        priority: Priority.HIGH,
        status: Status.PENDING,
        description: "Improve sleep and reduce morning glare.",
      },
      {
        title: "Area rug",
        price: 17800,
        priority: Priority.MEDIUM,
        status: Status.PENDING,
        description: "Warm up the living room floor.",
      },
      {
        title: "Floor lamp",
        price: 7600,
        priority: Priority.MEDIUM,
        status: Status.PURCHASED,
        description: "Add indirect evening lighting.",
      },
      {
        title: "Humidifier",
        price: 12800,
        priority: Priority.HIGH,
        status: Status.PENDING,
        description: "Keep indoor air comfortable in winter.",
      },
      {
        title: "Storage baskets",
        price: 3900,
        priority: Priority.LOW,
        status: Status.PENDING,
        description: "Tidy shelves and entryway storage.",
      },
      {
        title: "Bedding set",
        price: 14800,
        priority: Priority.MEDIUM,
        status: Status.PENDING,
        description: "Replace worn sheets and covers.",
      },
      {
        title: "Air purifier",
        price: 23800,
        priority: Priority.URGENT,
        status: Status.PENDING,
        description: "Improve air quality in the bedroom.",
      },
    ],
  },
  {
    name: "Office2",
    description: "Shared office spaces, meeting areas, and daily supplies.",
    planned: [
      {
        title: "Conference table",
        price: 68000,
        priority: Priority.HIGH,
        status: Status.PENDING,
        description: "Meeting table for team discussions and client visits.",
      },
      {
        title: "Meeting room chairs",
        price: 14800,
        priority: Priority.HIGH,
        status: Status.PENDING,
        quantity: 8,
        description: "Chairs for the conference room.",
      },
      {
        title: "Whiteboard",
        price: 12800,
        priority: Priority.MEDIUM,
        status: Status.PURCHASED,
        description: "Large board for planning and presentations.",
      },
      {
        title: "Video conference camera",
        price: 25800,
        priority: Priority.HIGH,
        status: Status.PENDING,
        description: "Camera for remote meetings.",
      },
      {
        title: "Storage shelves",
        price: 17800,
        priority: Priority.LOW,
        status: Status.PENDING,
        quantity: 2,
        description: "Shelving for supplies, equipment, and paperwork.",
      },
      {
        title: "Reception chairs",
        price: 9800,
        priority: Priority.MEDIUM,
        status: Status.PENDING,
        quantity: 4,
        description: "Visitor seating near the office entrance.",
      },
      {
        title: "Coffee machine",
        price: 19800,
        priority: Priority.LOW,
        status: Status.CANCELLED,
        description: "Coffee station for staff and guests.",
      },
    ],
  },
  {
    name: "Office1",
    description: "Core furniture and equipment for setting up a small office.",
    planned: [
      {
        title: "Office desks",
        price: 42000,
        priority: Priority.HIGH,
        status: Status.PENDING,
        quantity: 4,
        description: "Work desks for the main office area.",
      },
      {
        title: "Ergonomic office chairs",
        price: 28000,
        priority: Priority.HIGH,
        status: Status.PENDING,
        quantity: 4,
        description: "Adjustable chairs with lumbar support.",
      },
      {
        title: "Desktop monitor",
        price: 24000,
        priority: Priority.HIGH,
        status: Status.PENDING,
        quantity: 4,
        description: "External displays for daily desk work.",
      },
      {
        title: "Laptop docking stations",
        price: 13800,
        priority: Priority.MEDIUM,
        status: Status.PENDING,
        quantity: 4,
        description: "Single-cable desk connections for laptops.",
      },
      {
        title: "Printer scanner",
        price: 31800,
        priority: Priority.MEDIUM,
        status: Status.PENDING,
        description: "Shared office printer and document scanner.",
      },
      {
        title: "Wi-Fi router",
        price: 16800,
        priority: Priority.URGENT,
        status: Status.PENDING,
        description: "Reliable wireless network for the office.",
      },
      {
        title: "Filing cabinets",
        price: 12800,
        priority: Priority.LOW,
        status: Status.PURCHASED,
        quantity: 2,
        description: "Lockable storage for documents and supplies.",
      },
    ],
  },
];

function seededProductUrl(title: string) {
  return `https://example.com/products/${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

async function main() {
  const result = await prisma.$transaction(async (tx) => {
    await tx.app.deleteMany({
      where: {
        subdomain: {
          in: apps.map((app) => app.subdomain),
        },
      },
    });

    const user = await tx.user.upsert({
      where: { email: guestUser.email },
      update: {
        name: guestUser.name,
        image: guestUser.image,
      },
      create: {
        email: guestUser.email,
        name: guestUser.name,
        image: guestUser.image,
        emailVerified: seedStartedAt,
      },
    });

    const createdApps = await Promise.all(
      apps.map((app) =>
        tx.app.create({
          data: {
            ...app,
            memberships: {
              create: {
                userId: user.id,
                role: Role.OWNER,
              },
            },
          },
        }),
      ),
    );

    const personalApp = createdApps.find(
      (app) => app.subdomain === "personal-expenses",
    );

    if (!personalApp) {
      throw new Error("Personal Expenses app was not created.");
    }

    await tx.essential.createMany({
      data: essentials.map((essential, index) => {
        const createdAt = daysAgo(essentials.length - index);
        return {
          ...essential,
          appId: personalApp.id,
          creatorId: user.id,
          createdAt,
          updatedAt: daysAgo(index % 5),
        };
      }),
    });

    let plannedCount = 0;

    for (const [projectIndex, projectSeed] of projects.entries()) {
      const projectCreatedAt = daysAgo(150 - projectIndex * 12);
      const project = await tx.project.create({
        data: {
          name: projectSeed.name,
          description: projectSeed.description,
          creatorId: user.id,
          appId: personalApp.id,
          createdAt: projectCreatedAt,
          updatedAt: projectCreatedAt,
        },
      });

      const plannedData = projectSeed.planned.map((planned, plannedIndex) => {
        const createdAt = daysAgo(140 - projectIndex * 14 - plannedIndex * 2);

        return {
          ...planned,
          productUrl: planned.productUrl ?? seededProductUrl(planned.title),
          image: planned.image ?? plannedPlaceholderImage,
          appId: personalApp.id,
          creatorId: user.id,
          projectId: project.id,
          projectAppId: personalApp.id,
          createdAt,
          updatedAt:
            planned.status === Status.PENDING
              ? daysAgo((projectIndex + plannedIndex) % 10)
              : createdAt,
        };
      });

      await tx.planned.createMany({
        data: plannedData,
      });

      plannedCount += plannedData.length;
    }

    return {
      email: user.email,
      appCount: createdApps.length,
      essentialCount: essentials.length,
      projectCount: projects.length,
      plannedCount,
    };
  });

  console.log(
    [
      `Seeded ${result.email}.`,
      `Apps: ${result.appCount}.`,
      `Personal Essentials: ${result.essentialCount}.`,
      `Personal Projects: ${result.projectCount}.`,
      `Personal Planned items: ${result.plannedCount}.`,
    ].join(" "),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
