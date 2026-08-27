"use client";

import { type ComponentProps, useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function StartDemoButton({
  className,
  variant,
}: {
  className?: string;
  variant?: ComponentProps<typeof Button>["variant"];
}) {
  const locale = useLocale();
  const t = useTranslations("Demo");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function startDemo() {
    setPending(true);
    setFailed(false);

    try {
      const result = await signIn("demo", {
        intent: "showcase",
        redirect: false,
        callbackUrl: `/${locale}/demo-launch`,
      });

      if (!result?.url) {
        setFailed(true);
        return;
      }

      window.location.assign(result.url);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        size="lg"
        variant={variant}
        className="w-full sm:w-fit"
        onClick={startDemo}
        disabled={pending}
      >
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        {pending ? t("preparing") : t("start")}
      </Button>
      {failed ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {t("startError")}
        </p>
      ) : null}
    </div>
  );
}
