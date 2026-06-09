"use client";

import { verifyTwoFactorChallenge } from "@/actions/twoFactorActions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

type TwoFactorFormProps = {
  callbackUrl?: string;
};

export default function TwoFactorForm({ callbackUrl }: TwoFactorFormProps) {
  const t = useTranslations("TwoFactor");
  const [state, action, isPending] = useActionState(verifyTwoFactorChallenge, {
    ok: false,
  });

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/"} />
      <div className="grid gap-2">
        <Label htmlFor="code">{t("fields.codeOrRecovery")}</Label>
        <Input
          id="code"
          name="code"
          inputMode="text"
          autoComplete="one-time-code"
          placeholder={t("challenge.placeholder")}
          autoFocus
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
        {t("challenge.submit")}
      </Button>
      {state.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>{t(`messages.${state.message}`)}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
