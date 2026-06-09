"use client";

import {
  confirmTwoFactorSetup,
  disableTwoFactor,
  regenerateRecoveryCodes,
  startTwoFactorSetup,
} from "@/actions/twoFactorActions";
import type { ActionResult } from "@/lib/initial-action-return";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Copy, KeyRound, Loader2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition, useActionState } from "react";

type SetupData = {
  qrCodeDataUrl: string;
  otpAuthUrl: string;
};

type RecoveryCodesData = {
  recoveryCodes: string[];
};

type TwoFactorSettingsProps = {
  initialEnabled: boolean;
  initialRecoveryCodeCount: number;
};

const initialActionState: ActionResult = { ok: false };
const initialRecoveryCodesState: ActionResult<RecoveryCodesData> = {
  ok: false,
};

function messageText(
  t: ReturnType<typeof useTranslations<"TwoFactor">>,
  message?: string,
) {
  if (!message) return null;
  return t(`messages.${message}`);
}

function RecoveryCodes({
  recoveryCodes,
}: {
  recoveryCodes?: string[];
}) {
  const t = useTranslations("TwoFactor");

  if (!recoveryCodes?.length) return null;

  return (
    <Alert>
      <KeyRound className="h-4 w-4" />
      <AlertTitle>{t("recoveryCodes.title")}</AlertTitle>
      <AlertDescription>
        <p>{t("recoveryCodes.description")}</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {recoveryCodes.map((code) => (
            <code
              key={code}
              className="rounded-md border bg-muted px-3 py-2 font-mono text-sm"
            >
              {code}
            </code>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}

function ActionMessage({
  state,
}: {
  state: ActionResult;
}) {
  const t = useTranslations("TwoFactor");
  const message = messageText(t, state.message);

  if (!message) return null;

  return (
    <Alert variant={state.ok ? "default" : "destructive"}>
      {state.ok ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>{state.ok ? t("success") : t("error")}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export default function TwoFactorSettings({
  initialEnabled,
  initialRecoveryCodeCount,
}: TwoFactorSettingsProps) {
  const t = useTranslations("TwoFactor");
  const [enabled, setEnabled] = useState(initialEnabled);
  const [recoveryCodeCount, setRecoveryCodeCount] = useState(
    initialRecoveryCodeCount,
  );
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [latestRecoveryCodes, setLatestRecoveryCodes] = useState<string[]>();
  const [isStarting, startTransition] = useTransition();
  const [confirmState, confirmAction, isConfirmPending] = useActionState(
    confirmTwoFactorSetup,
    initialRecoveryCodesState,
  );
  const [disableState, disableAction, isDisablePending] = useActionState(
    disableTwoFactor,
    initialActionState,
  );
  const [regenerateState, regenerateAction, isRegeneratePending] =
    useActionState(regenerateRecoveryCodes, initialRecoveryCodesState);

  useEffect(() => {
    if (confirmState.ok && confirmState.data?.recoveryCodes) {
      setEnabled(true);
      setSetup(null);
      setLatestRecoveryCodes(confirmState.data.recoveryCodes);
      setRecoveryCodeCount(confirmState.data.recoveryCodes.length);
    }
  }, [confirmState]);

  useEffect(() => {
    if (disableState.ok) {
      setEnabled(false);
      setSetup(null);
      setLatestRecoveryCodes(undefined);
      setRecoveryCodeCount(0);
    }
  }, [disableState]);

  useEffect(() => {
    if (regenerateState.ok && regenerateState.data?.recoveryCodes) {
      setLatestRecoveryCodes(regenerateState.data.recoveryCodes);
      setRecoveryCodeCount(regenerateState.data.recoveryCodes.length);
    }
  }, [regenerateState]);

  function handleStartSetup() {
    setSetupError(null);
    startTransition(async () => {
      const result = await startTwoFactorSetup();
      if (result.ok && result.data) {
        setSetup(result.data);
        return;
      }
      setSetupError(result.message ?? "serverError");
    });
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-4 px-4 pb-24 pt-8 md:pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>{t("app.title")}</CardTitle>
              <CardDescription>{t("app.description")}</CardDescription>
            </div>
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? t("status.enabled") : t("status.disabled")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!enabled ? (
            <>
              <Button
                type="button"
                onClick={handleStartSetup}
                disabled={isStarting}
                className="w-full"
              >
                {isStarting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <KeyRound />
                )}
                {t("setup.start")}
              </Button>
              {setupError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("error")}</AlertTitle>
                  <AlertDescription>
                    {messageText(t, setupError)}
                  </AlertDescription>
                </Alert>
              )}
              {setup && (
                <div className="grid gap-4 rounded-lg border p-4">
                  <div className="grid gap-2">
                    <h2 className="font-medium">{t("setup.scanTitle")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("setup.scanDescription")}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Image
                      src={setup.qrCodeDataUrl}
                      alt={t("setup.qrAlt")}
                      width={220}
                      height={220}
                      unoptimized
                      className="rounded-md border bg-white p-2"
                    />
                  </div>
                  <details className="text-sm">
                    <summary className="cursor-pointer">
                      {t("setup.manualEntry")}
                    </summary>
                    <code className="mt-2 block break-all rounded-md bg-muted p-3">
                      {setup.otpAuthUrl}
                    </code>
                  </details>
                  <form action={confirmAction} className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="setup-code">{t("fields.code")}</Label>
                      <Input
                        id="setup-code"
                        name="code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                      />
                    </div>
                    <Button type="submit" disabled={isConfirmPending}>
                      {isConfirmPending && <Loader2 className="animate-spin" />}
                      {t("setup.confirm")}
                    </Button>
                  </form>
                  <ActionMessage state={confirmState} />
                </div>
              )}
            </>
          ) : (
            <>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>{t("enabled.title")}</AlertTitle>
                <AlertDescription>
                  {t("enabled.description", { count: recoveryCodeCount })}
                </AlertDescription>
              </Alert>
              <RecoveryCodes recoveryCodes={latestRecoveryCodes} />

              <div className="grid gap-4">
                <form action={regenerateAction} className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="regenerate-code">
                      {t("fields.currentCode")}
                    </Label>
                    <Input
                      id="regenerate-code"
                      name="code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="123456"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isRegeneratePending}
                  >
                    {isRegeneratePending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Copy />
                    )}
                    {t("recoveryCodes.regenerate")}
                  </Button>
                </form>
                <ActionMessage state={regenerateState} />
              </div>

              <Separator />

              <form action={disableAction} className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="disable-code">
                    {t("fields.currentCode")}
                  </Label>
                  <Input
                    id="disable-code"
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                  />
                </div>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDisablePending}
                >
                  {isDisablePending && <Loader2 className="animate-spin" />}
                  {t("disable.submit")}
                </Button>
              </form>
              <ActionMessage state={disableState} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
