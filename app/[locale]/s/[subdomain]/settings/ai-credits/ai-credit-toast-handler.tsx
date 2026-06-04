"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function AiCreditToastHandler() {
  const t = useTranslations("Settings");
  const searchParams = useSearchParams();
  const router = useRouter();
  const serialized = searchParams?.toString();

  useEffect(() => {
    if (!serialized) return;

    const params = new URLSearchParams(serialized);
    const status = params.get("aiCredits");
    if (!status) return;

    if (status === "success") {
      toast.success(t("aiCredits.paymentSuccess"));
    } else if (status === "cancelled") {
      toast.info(t("aiCredits.paymentCancelled"));
    }

    params.delete("aiCredits");
    const newQuery = params.toString();
    const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [serialized, router, t]);

  return null;
}
