"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RefreshBalanceButton() {
  const t = useTranslations("Settings");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      className="w-fit gap-2"
    >
      <RefreshCw className={isPending ? "size-4 animate-spin" : "size-4"} />
      {isPending ? t("aiCredits.refreshing") : t("aiCredits.refreshBalance")}
    </Button>
  );
}
