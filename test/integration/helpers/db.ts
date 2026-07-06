import { PrismaClient } from "@/prisma/generated/prisma";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl?.includes("test-db")) {
  throw new Error(
    "Integration tests require TEST_DATABASE_URL pointing to test-db.",
  );
}

export const testPrisma = new PrismaClient({
  datasourceUrl: testDatabaseUrl,
});

export async function cleanDatabase() {
  await testPrisma.aiCreditLedger.deleteMany();
  await testPrisma.plannedLike.deleteMany();
  await testPrisma.plannedComment.deleteMany();
  await testPrisma.planned.deleteMany();
  await testPrisma.essential.deleteMany();
  await testPrisma.project.deleteMany();
  await testPrisma.invitation.deleteMany();
  await testPrisma.membership.deleteMany();
  await testPrisma.app.deleteMany();
  await testPrisma.session.deleteMany();
  await testPrisma.account.deleteMany();
  await testPrisma.authenticator.deleteMany();
  await testPrisma.twoFactorRecoveryCode.deleteMany();
  await testPrisma.userTwoFactor.deleteMany();
  await testPrisma.user.deleteMany();
}

export async function createTestUser(
  overrides: Partial<{
    email: string;
    name: string;
    image: string | null;
  }> = {},
) {
  return testPrisma.user.create({
    data: {
      email: overrides.email ?? `user-${crypto.randomUUID()}@example.com`,
      name: overrides.name ?? "Test User",
      image: overrides.image,
    },
  });
}
