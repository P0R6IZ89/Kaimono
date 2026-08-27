import {
  createAccountFromDemoAction,
  endDemoAction,
  resetDemoAction,
} from "@/actions/demoActions";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, RotateCcw, UserPlus } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function DemoModeBanner({
  expiresAt,
  locale,
}: {
  expiresAt: string | null | undefined;
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "Demo" });
  const expiration = expiresAt
    ? new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(expiresAt))
    : null;

  return (
    <aside className="border-b bg-primary px-4 py-3 text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium">{t("banner.title")}</p>
          <p className="flex items-center gap-1 text-sm text-primary-foreground/80">
            <Clock className="size-3.5" aria-hidden="true" />
            {expiration
              ? t("banner.expiresAt", { time: expiration })
              : t("banner.temporary")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={resetDemoAction}>
            <Button type="submit" size="sm" variant="secondary">
              <RotateCcw />
              {t("reset")}
            </Button>
          </form>
          <form action={createAccountFromDemoAction}>
            <Button type="submit" size="sm" variant="secondary">
              <UserPlus />
              {t("createAccount")}
            </Button>
          </form>
          <form action={endDemoAction}>
            <Button type="submit" size="sm" variant="outline">
              <LogOut />
              {t("end")}
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
