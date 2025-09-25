// prisma/seed.tsx
import "dotenv/config";
import { PrismaClient, Prisma, Role, InvitationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Clean slate: delete in dependency order
  await prisma.plannedLike.deleteMany();
  await prisma.plannedComment.deleteMany();
  await prisma.planned.deleteMany();
  await prisma.essential.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.app.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.authenticator.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create users
  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
      image: "https://example.com/alice.png",
      emailVerified: new Date(),
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob",
      image: "https://example.com/bob.png",
      emailVerified: new Date(),
    },
  });

  // 3. Create an app
  const projectX = await prisma.app.create({
    data: {
      name: "Project X",
      description: "A secret planning app",
      subdomain: "project-x",
      image: "https://example.com/logo.png",
    },
  });

  // 4. Memberships: Alice as OWNER, Bob as MEMBER
  await prisma.membership.createMany({
    data: [
      { appId: projectX.id, userId: alice.id, role: Role.OWNER },
      { appId: projectX.id, userId: bob.id, role: Role.MEMBER },
    ],
  });

  // 5. Send an invitation (pending)
  await prisma.invitation.create({
    data: {
      appId: projectX.id,
      email: "charlie@example.com",
      token: "invite-token-123",
      role: Role.MEMBER,
      inviterId: alice.id,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
    },
  });

  // 6. Create an Essential item
  await prisma.essential.create({
    data: {
      title: "MacBook Pro",
      price: new Prisma.Decimal(2499),
      status: "PENDING",
      quantity: 1,
      appId: projectX.id,
      creatorId: alice.id,
    },
  });

  // 7. Create a Planned item
  const ergonomicChair = await prisma.planned.create({
    data: {
      title: "Ergonomic Office Chair",
      price: new Prisma.Decimal(399),
      priority: "HIGH",
      status: "PURCHASED",
      image: "https://example.com/chair.png",
      productUrl: "https://shop.example.com/chair",
      description: "A chair to improve posture and productivity.",
      appId: projectX.id,
      creatorId: bob.id,
    },
  });

  // 8. Add a comment and a like to the planned item
  await prisma.plannedComment.create({
    data: {
      content: "Great choice, Bob – that looks very comfortable!",
      authorId: alice.id,
      plannedId: ergonomicChair.id,
    },
  });

  await prisma.plannedLike.create({
    data: {
      liked: true,
      creatorId: alice.id,
      plannedId: ergonomicChair.id,
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
