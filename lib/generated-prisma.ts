import { PrismaClient } from "@/prisma/generated/prisma";

const globalForGeneratedPrisma = global as unknown as {
  generatedPrisma: PrismaClient | undefined;
};

const generatedPrisma =
  globalForGeneratedPrisma.generatedPrisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForGeneratedPrisma.generatedPrisma = generatedPrisma;
}

export default generatedPrisma;
