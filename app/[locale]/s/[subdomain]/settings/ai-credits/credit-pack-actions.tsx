"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

type CreditPack = {
  id: "starter" | "value";
  label: string;
};

type CheckoutResponse = {
  url?: string;
  error?: string;
};

export function CreditPackActions({ packs }: { packs: CreditPack[] }) {
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
          returnUrl: window.location.href,
        }),
      });
      const data = (await response.json()) as CheckoutResponse;

      if (!response.ok || !data.url) {
        setError(data.error || t("aiCredits.checkoutFailed"));
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(t("aiCredits.checkoutFailed"));
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
            variant={pack.id === "starter" ? "default" : "outline"}
            onClick={() => void handleCheckout(pack.id)}
            disabled={pendingPackId !== null}
            className="w-full justify-center gap-2"
          >
            <CreditCard className="size-4" />
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
