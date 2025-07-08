// prisma/seed.ts
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Create or fetch two users
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice",
      email: "alice@example.com",
      emailVerified: new Date(),
      image: "https://example.com/avatar/alice.png",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob",
      email: "bob@example.com",
      image: "https://example.com/avatar/bob.png",
    },
  });

  // 2. Create an App and connect both users as members
  const myApp = await prisma.app.upsert({
    where: { subdomain: "myapp" },
    update: {},
    create: {
      name: "MyApp",
      description: "A demo application",
      subdomain: "myapp",
      customDomain: "app.mycompany.com",
      image: "https://example.com/logo.png",
      user: {
        connect: [{ id: alice.id }, { id: bob.id }],
      },
    },
  });

  // 3. Seed two Essential items
  const essential1 = await prisma.essential.create({
    data: {
      title: "Essential Item One",
      price: new Prisma.Decimal("9.99"),
      status: "pending",
      quantity: 2,
      app: { connect: { id: myApp.id } },
      creator: { connect: { id: alice.id } },
    },
  });

  await prisma.essential.create({
    data: {
      title: "Essential Item Two",
      price: new Prisma.Decimal("19.99"),
      status: "completed",
      quantity: 1,
      app: { connect: { id: myApp.id } },
      creator: { connect: { id: bob.id } },
    },
  });

  // 4. Seed two Planned items
  const planned1 = await prisma.planned.create({
    data: {
      title: "Planned Purchase A",
      price: new Prisma.Decimal("29.99"),
      priority: "high",
      status: "todo",
      image: "https://example.com/item-a.png",
      productUrl: "https://store.example.com/item-a",
      description: "First planned purchase",
      app: { connect: { id: myApp.id } },
      creator: { connect: { id: alice.id } },
    },
  });

  const planned2 = await prisma.planned.create({
    data: {
      title: "Planned Purchase B",
      price: null,
      priority: "low",
      status: "in-progress",
      image: "https://example.com/item-b.png",
      productUrl: null,
      description: null,
      app: { connect: { id: myApp.id } },
      creator: { connect: { id: bob.id } },
    },
  });

  // 5. Add comments
  await prisma.essentialComment.create({
    data: {
      content: "Looks great!",
      essential: { connect: { id: essential1.id } },
      author: { connect: { id: bob.id } },
    },
  });

  await prisma.plannedComment.create({
    data: {
      content: "Can’t wait for this.",
      planned: { connect: { id: planned2.id } },
      author: { connect: { id: alice.id } },
    },
  });

  // 6. Add likes
  await prisma.essentialLike.create({
    data: {
      liked: true,
      essential: { connect: { id: essential1.id } },
      user: { connect: { id: bob.id } },
    },
  });

  await prisma.plannedLike.create({
    data: {
      liked: true,
      planned: { connect: { id: planned1.id } },
      creator: { connect: { id: alice.id } },
    },
  });

  console.log("✅ Seed data created successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
