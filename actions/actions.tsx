"use server";

import { TableRowData } from "@/components/(essential)/table/essentials-columns";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Row } from "@tanstack/react-table";
import { revalidatePath } from "next/cache";

export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
      },
    });
    return account;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Don't need a Google provider Account
export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export async function getCount() {
  try {
    const fullCount = await prisma.essentials.count({});
    const pendingCount = await prisma.essentials.count({
      where: { status: "pending" },
    });

    return {
      success: true,
      data: { fullCount, pendingCount },
    };
  } catch (error) {
    console.error("Error fetching count:", error);
    return {
      success: false,
      data: { fullCount: 0, pendingCount: 0 },
      error: "Failed to retrieve count data. Please try again later.",
    };
  }
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
) {
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
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return e.message;
    }
  }
}
