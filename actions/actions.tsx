"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateEssentials(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const priceString = formData.get("price") as string;
  const quantityString = formData.get("quantity") as string;
  const status = formData.get("status") as string;

  // Convert the string values to numbers
  const price = parseFloat(priceString);
  const quantity = parseInt(quantityString, 10);

  // Check if the conversion succeeded
  if (isNaN(price)) {
    throw new Error("Invalid price value provided.");
  }
  if (isNaN(quantity)) {
    throw new Error("Invalid quantity value provided.");
  }
  await prisma.essentials.update({
    where: { id },
    data: {
      title,
      price,
      quantity,
      status,
    },
  });
  revalidatePath("/dashboard/essentials-v2");
}

export async function createEssentials(formData: FormData) {
  const title = formData.get("title") as string;
  const priceString = formData.get("price") as string;
  const quantityString = formData.get("quantity") as string;
  const status = formData.get("status") as string;

  // Convert the string values to numbers
  const price = parseFloat(priceString);
  const quantity = parseInt(quantityString, 10);

  // Check if the conversion succeeded
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
