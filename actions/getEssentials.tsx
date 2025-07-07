import prisma from "@/lib/prisma";

export async function getEssentials() {
  try {
    const essentials = await prisma.essential.findMany({
      include: {
        creator: {
          select: {
            name: true,
          },
        },
      },
    });
    return {
      success: true,
      essentials: essentials.map((item) => ({
        ...item,
        price: item.price?.toNumber(),
        createdAt: item.createdAt?.toISOString(),
        updatedAt: item.updatedAt?.toISOString(),
        user: { name: item.creator.name ?? "" },
        name: item.creator.name ?? "",
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
