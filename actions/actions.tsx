"use server";

import { prisma } from "@/lib/prisma";
import { essentialsSchema } from "@/lib/schemas/essentials";

export async function createEssentials(formData: FormData) {
  const formObject = Object.fromEntries(formData.entries());

  const parsedData = essentialsSchema.parse({
    title: formObject.title,
    price: Number(formObject.price),
    quantity: Number(formObject.quantity),
    status: formObject.status,
  });

  await prisma.essentials.create({
    data: parsedData,
  });
}
