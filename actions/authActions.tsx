"use server";

import { signIn, signOut } from "@/auth";
import { getCurrentLocale, redirect } from "@/i18n/navigation";
import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/lib/error-handler";
import type { ActionResult } from "@/lib/initial-action-return";
import { revalidatePath } from "next/cache";

export async function magicLinkSignIn(prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  if (!email || typeof email !== "string") {
    return { error: "Email invalido, verifique o seu email" };
  }
  const result = await signIn("resend", {
    email,
    redirect: false,
  });
  if (result?.error) {
    return { error: "Erro no servidor, tente novamente" };
  }
  const locale = await getCurrentLocale();
  return redirect({ href: "/welcome", locale });
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
    throw new Error(getErrorMessage(error));
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
};

export async function signOutAction(): Promise<ActionResult> {
  try {
    await signOut({ redirect: false });
    revalidatePath("/");
    return { ok: true, message: "" };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
