"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/authActions";
import { useLocale, useTranslations } from "next-intl";
import { protocol, rootDomain } from "@/util/utils";

export default function LogoutPage() {
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const t = useTranslations("Auth");

  const handleLogout = async () => {
    setLoading(true);
    const result = await signOutAction();
    if (result.ok) {
      window.location.assign(`${protocol}://${rootDomain}/${locale}/login`);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 min-h-dvh max-w-lg m-auto justify-center items-center px-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("logout.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("logout.instruction")}
        </p>
      </div>
      <div className="mt-4">
        <Button onClick={handleLogout} disabled={loading} className="min-w-sm">
          {loading ? t("loggingOut") : t("logout.button")}
        </Button>
      </div>
    </div>
  );
}
