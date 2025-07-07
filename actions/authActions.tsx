"use server";

import { signIn } from "@/auth";
import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/util/error-handler";
import { redirect } from "next/navigation";

export async function magicLinkSignIn(
  prevState: void,
  formData: FormData
): Promise<void> {
  const email = String(formData.get("email") ?? "");
  if (!email || typeof email !== "string") {
    throw new Error("Email invalido");
  }
  const result = await signIn("resend", {
    email,
    redirect: false,
  });
  if (result) {
    redirect("/welcome");
  }
}

export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
      },
    });
    return account;
  } catch (error: unknown) {
    console.error("[getAccountByUserId] unexpected error:", error);
    throw new Error(getErrorMessage(error));
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
  } catch (error: unknown) {
    console.error("[getUserById] unexpected error:", error);
    throw new Error(getErrorMessage(error));
  }
};
