import { prisma } from "@/lib/prisma";

export async function getEssentials() {
  try {
    const essentials = await prisma.essentials.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    console.log(JSON.stringify(essentials));
    return {
      success: true,
      essentials: essentials.map((item) => ({
        ...item,
        price: item.price?.toNumber(),
        createdAt: item.createdAt?.toISOString(),
        updatedAt: item.updatedAt?.toISOString(),
        user: { name: item.user.name ?? "" },
        name: item.user.name ?? "",
      })),
    };
  } catch (error) {
    console.error(
      "Error fetching essentials data:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      error: "Failed to load essential products. Please try again later.",
    };
  }
}
