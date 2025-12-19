import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import React from "react";
import { useTranslations } from "next-intl";

function Welcome() {
  const t = useTranslations("Auth");
  return (
    <div className="flex flex-col min-h-dvh  m-auto justify-center items-center text-center px-4">
      <p className="text-9xl font-semibold leading-none tracking-tighter">✨</p>
      <p className="text-3xl pt-8 font-semibold">{t("email-sent-title")}</p>
      <div className="">
        <p className="pt-2">{t("email-sent-instruction")}</p>
        <p className="text-xs text-muted-foreground">{t("check-spam")}</p>
        <div className="pt-8">
          <Link href={"/"}>
            <Button>{t("back-to-main")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
