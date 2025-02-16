"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getData() {
  try {
    const data = await prisma.essentials.findMany();
    return data.map((item) => ({
      ...item,
      price: item.price.toNumber(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching essentials data:", error);
    throw new Error("Failed to fetch essentials data.");
  }
}

export async function getCount() {
  const count = {
    fullCount: await prisma.essentials.count({}),
    pendingCount: await prisma.essentials.count({
      where: {
        status: "pending",
      },
    }),
  };
  return count;
}

export async function createEssentials(formData: FormData) {
  const title = formData.get("title") as string;
  const priceString = formData.get("price") as string;
  const quantityString = formData.get("quantity") as string;
  const status = formData.get("status") as string;
  const price = parseFloat(priceString);
  const quantity = parseInt(quantityString, 10);

  if (isNaN(price)) {
    throw new Error("Invalid price value provided.");
  }
  if (isNaN(quantity)) {
    throw new Error("Invalid quantity value provided.");
  }
  await prisma.essentials.create({
    data: {
      title,
      price,
      quantity,
      status,
    },
  });
  revalidatePath("/dashboard/essentials-v2");
}

export async function updateEssentials(id: string, actionType: string) {
  await prisma.essentials.update({
    where: { id },
    data: {
      status: actionType,
    },
  });
  revalidatePath("/dashboard/essentials-v2");
}

export async function deleteEssentials(id: string) {
  await prisma.essentials.delete({
    where: {
      id,
    },
  });
  revalidatePath("/dashboard/essentials-v2");
}
