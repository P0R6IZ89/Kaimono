"use server";

import { signIn, signOut } from "@/auth";
import { getCurrentLocale, redirect } from "@/i18n/navigation";
import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/util/error-handler";
import type { ActionResult } from "@/util/initial-action-return";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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
    // If you previously had host-only cookies (no Domain attribute) and later switched to a
    // domain-scoped cookie for subdomains (e.g. .p0r6iz89.cloud), the browser can keep BOTH.
    // Auth.js will delete the domain-scoped one, but the old host-only one can remain and keep you logged in.
    // Explicitly expire the host-only variants as a one-time cleanup.
    const cookieStore = await cookies();
    const past = new Date(0);

    // Auth.js v5 cookie name
    cookieStore.set("__Secure-authjs.session-token", "", {
      path: "/",
      expires: past,
    });

    // In case a non-__Secure name is present (local/dev or older config)
    cookieStore.set("authjs.session-token", "", {
      path: "/",
      expires: past,
    });

    // Legacy NextAuth v4 naming (harmless if absent)
    cookieStore.set("__Secure-next-auth.session-token", "", {
      path: "/",
      expires: past,
    });
    cookieStore.set("next-auth.session-token", "", {
      path: "/",
      expires: past,
    });
    revalidatePath("/");
    return { ok: true, message: "" };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
