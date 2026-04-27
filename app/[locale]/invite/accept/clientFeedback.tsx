"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { translateMessage } from "@/lib/translate-message";

interface Props {
  error?: string;
}

export default function ClientFeedback({ error }: Props) {
  const t = useTranslations("InviteAccept");
  useEffect(() => {
    if (error) {
      toast.error(translateMessage(t, error));
    }
  }, [error, t]);

  return (
    <div className="max-w-md mx-auto mt-28 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
      <p className="mb-4">
        {translateMessage(t, error) || t("genericError")}
      </p>
    </div>
  );
}
