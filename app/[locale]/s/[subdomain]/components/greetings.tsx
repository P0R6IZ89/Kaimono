import { requireSession } from "@/actions/appActions";
import { getLocale, getTranslations } from "next-intl/server";

export async function Greetings() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Dashboard" });

  const { user } = await requireSession();
  return user?.name ? t("hello", { userName: user.name }) : t("hello2");
}
