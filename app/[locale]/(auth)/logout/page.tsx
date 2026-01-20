"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/authActions";
import { useLocale } from "next-intl";
import { protocol, rootDomain } from "@/util/utils";

export default function LogoutPage() {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const locale = useLocale();
  const hasTriggered = useRef(false);

  const handleLogout = useCallback(async () => {
    setHasError(false);
    setLoading(true);
    const result = await signOutAction();
    if (!result.ok) {
      setLoading(false);
      setHasError(true);
      return;
    }
    window.location.assign(`${protocol}://${rootDomain}/${locale}/login`);
  }, [locale]);

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    void handleLogout();
  }, [handleLogout]);

  return (
    <div className="flex flex-col gap-4 min-h-dvh max-w-lg m-auto justify-center items-center px-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Espero que você volte 🤗
        </h1>
        <p className="text-muted-foreground">
          {hasError
            ? "Falha ao sair. Tente novamente."
            : "Estamos encerrando sua sessão."}
        </p>
      </div>
      <div className="mt-4">
        <Button onClick={handleLogout} disabled={loading} className="min-w-sm">
          {loading ? "Saindo…" : "Tentar novamente"}
        </Button>
      </div>
    </div>
  );
}
