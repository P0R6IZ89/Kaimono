"use server";

import { auth, signOut } from "@/auth";
import { deleteDemoGuest, resetDemoGuestWorkspace } from "@/lib/demo-guest";
import { getCurrentLocale } from "@/i18n/navigation";
import { revalidatePath } from "next/cache";

async function getDemoUserId() {
  const session = await auth();
  if (!session?.user?.id || !session.isDemo) return null;
  return session.user.id;
}

export async function resetDemoAction(): Promise<void> {
  const userId = await getDemoUserId();
  if (!userId) return;

  await resetDemoGuestWorkspace(userId);
  revalidatePath("/");
}

export async function endDemoAction(): Promise<void> {
  const locale = await getCurrentLocale();
  const userId = await getDemoUserId();
  if (userId) await deleteDemoGuest(userId);

  await signOut({ redirectTo: `/${locale}/home` });
}

export async function createAccountFromDemoAction(): Promise<void> {
  const locale = await getCurrentLocale();
  const userId = await getDemoUserId();
  if (userId) await deleteDemoGuest(userId);

  await signOut({ redirectTo: `/${locale}/login` });
}
