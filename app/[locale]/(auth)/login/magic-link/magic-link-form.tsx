"use client";

import { useActionState } from "react";
import { AlertCircle, ChevronLeft, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { magicLinkSignIn } from "@/actions/authActions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { translateMessage } from "@/lib/translate-message";

interface MagicLinkFormProps {
  callbackUrl?: string;
}

export default function MagicLinkForm({ callbackUrl }: MagicLinkFormProps) {
  const router = useRouter();
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const tErrors = useTranslations("FormErrors");
  const [state, action, isPending] = useActionState(magicLinkSignIn, {
    error: "",
  });

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="name@example.com"
          autoComplete="email"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <Mail />}
        {t("signInWithEmail")}
      </Button>
      <Button
        variant="ghost"
        type="button"
        onClick={() => {
          const params = new URLSearchParams();
          if (callbackUrl) params.set("callbackUrl", callbackUrl);
          const query = params.toString();
          router.push(`/login${query ? `?${query}` : ""}`);
        }}
      >
        <ChevronLeft />
        {tCommon("actions.previous")}
      </Button>
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>
            {translateMessage(tErrors, state.error)}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
