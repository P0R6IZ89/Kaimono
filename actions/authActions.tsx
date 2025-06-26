"use server";

import { signIn } from "@/auth";
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
