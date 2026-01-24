"use server";

import { signIn, signOut } from "@/auth";
import { getCurrentLocale, redirect } from "@/i18n/navigation";
import prisma from "@/lib/prisma";
import { getErrorMessage } from "@/util/error-handler";
import type { ActionResult } from "@/util/initial-action-return";
import { rootDomainHost } from "@/util/utils";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";

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
    const isProd = process.env.NODE_ENV === "production";
    const cookieStore = await cookies();
    const headerStore = await headers();
    const hostHeader = headerStore.get("host") ?? "";
    const requestHost = hostHeader.split(":")[0];
    const cookieDomains = new Set<string | undefined>([undefined]);
    if (rootDomainHost) {
      cookieDomains.add(rootDomainHost);
      cookieDomains.add(`.${rootDomainHost}`);
    }

    if (requestHost && requestHost !== rootDomainHost) {
      cookieDomains.add(requestHost);
      cookieDomains.add(`.${requestHost}`);
    }

    const sessionCookies = isProd
      ? ["__Secure-authjs.session-token", "authjs.session-token"]
      : ["authjs.session-token", "__Secure-authjs.session-token"];

    for (const name of sessionCookies) {
      for (const domain of cookieDomains) {
        const baseOptions = {
          path: "/",
          secure: isProd,
          httpOnly: true,
          sameSite: "lax" as const,
          expires: 0,
        };
        if (domain) {
          cookieStore.set(name, "", { ...baseOptions, domain });
        } else {
          cookieStore.set(name, "", baseOptions);
        }
      }
    }

    // revalidatePath("/");
    return { ok: true, message: "" };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
