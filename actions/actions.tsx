"use server";

import { TableRowData } from "@/components/components-essential/table/essentials-columns";
import { prisma } from "@/lib/prisma";
import { Row } from "@tanstack/react-table";
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

export async function createEssentials(
  previousState: unknown,
  formData: FormData
) {
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
  try {
    await prisma.essentials.create({
      data: {
        title,
        price,
        quantity,
        status,
      },
    });
  } catch (e) {
    return String(e);
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));
  revalidatePath("/dashboard/essentials-v2");
}

export async function updateStatusEssentials(
  previusState: unknown,
  row: Row<TableRowData>,
  status: string
): Promise<{ status: "success" | "error"; message: string }> {
  const { id } = row.original;
  try {
    await prisma.essentials.update({
      where: { id },
      data: {
        status: status,
      },
    });
    revalidatePath("/dashboard/essentials-v2");
    return {
      status: "success",
      message: "O item foi atualizado com sucesso!",
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error?.message || "Falha ao atualizar.",
    };
  }
}

export async function deleteEssentials(
  previusState: unknown,
  row: Row<TableRowData>
): Promise<{ status: "success" | "error"; message: string }> {
  try {
    const { id } = row.original;
    await prisma.essentials.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/essentials-v2");
    return {
      status: "success",
      message: "O Essentials foi deletado com sucesso!",
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error?.message || "Falha ao deletar.",
    };
  }
}

export async function updateEssentials(
  prevState: unknown,
  formData: FormData,
  id: string
): Promise<{ status: "success" | "error"; message: string }> {
  try {
    const title = formData.get("title") as string;
    const priceString = formData.get("price") as string;
    const quantityString = formData.get("quantity") as string;
    const price = parseFloat(priceString);
    const quantity = parseInt(quantityString, 10);
    await prisma.essentials.update({
      where: { id },
      data: {
        title,
        price,
        quantity,
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    revalidatePath("/dashboard/essentials-v2");
    return {
      status: "success",
      message: "O Essentials foi atualizado com sucesso!",
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error?.message || "Falha ao atualizar.",
    };
  }
}
