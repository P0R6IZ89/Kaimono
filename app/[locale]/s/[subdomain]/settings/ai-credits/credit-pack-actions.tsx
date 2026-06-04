"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type CreditPack = {
  id: "starter" | "value";
  label: string;
};

type CheckoutResponse = {
  url?: string;
  error?: string;
};

export function CreditPackActions({
  packs,
  subdomain,
  locale,
}: {
  packs: CreditPack[];
  subdomain: string;
  locale: string;
}) {
  const t = useTranslations("Settings");
  const [pendingPackId, setPendingPackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (packId: CreditPack["id"]) => {
    setPendingPackId(packId);
    setError(null);

    try {
      const response = await fetch("/api/ai-credits/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packId,
          subdomain,
          locale,
        }),
      });
      const data = (await response.json()) as CheckoutResponse;

      if (!response.ok || !data.url) {
        const message = data.error || t("aiCredits.checkoutFailed");
        setError(message);
        toast.error(message);
        return;
      }

      window.location.href = data.url;
    } catch {
      const message = t("aiCredits.checkoutFailed");
      setError(message);
      toast.error(message);
    } finally {
      setPendingPackId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {packs.map((pack) => (
          <Button
            key={pack.id}
            type="button"
            variant="outline"
            onClick={() => void handleCheckout(pack.id)}
            disabled={pendingPackId !== null}
            className="w-full justify-center gap-2"
          >
            {pendingPackId === pack.id
              ? t("aiCredits.redirecting")
              : pack.label}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
