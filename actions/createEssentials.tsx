"use server";

import { auth } from "@/auth";
import { getErrorMessage } from "@/util/error-handler";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEssentials(
  previousState: unknown,
  formData: FormData
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized. User session not found.");
  }
  const title = formData.get("title") as string;
  const priceString = formData.get("price") as string;
  const quantityString = formData.get("quantity") as string;
  // const status = formData.get("status") as string;
  const price = parseFloat(priceString);
  const quantity = parseInt(quantityString, 10);

  if (isNaN(price)) {
    throw new Error("Invalid price value provided.");
  }
  if (isNaN(quantity)) {
    throw new Error("Invalid quantity value provided.");
  }
  try {
    await prisma.essentials.create({
      data: {
        title,
        price,
        quantity,
        status: "pending",
        user: {
          connect: { id: session.user.id },
        },
      },
    });
    revalidatePath("/dashboard/essentials-v2");
  } catch (error: unknown) {
    return {
      error: getErrorMessage(error),
    };
  }
}
