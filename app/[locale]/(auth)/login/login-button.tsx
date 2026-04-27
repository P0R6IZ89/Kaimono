"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import { AuthError } from "next-auth";
import React, { useActionState } from "react";
import { GithubIcon, Google } from "@/lib/oauth-icon";
import { magicLinkSignIn } from "@/actions/authActions";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { translateMessage } from "@/lib/translate-message";

const SIGNIN_ERROR_URL = "/error";

interface SignInProps {
  callbackUrl?: string;
}

export default function SignInButtons({ callbackUrl }: SignInProps) {
  const router = useRouter();
  const t = useTranslations("Auth");
  const tErrors = useTranslations("FormErrors");
  const initialState = { error: "" };
  const [state] = useActionState(magicLinkSignIn, initialState);

  const handleSignIn =
    (providerId: string) => async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        const result = await signIn(providerId, {
          redirect: false,
          callbackUrl,
        });
        if (result?.url) {
          router.push(result.url);
        }
      } catch (error) {
        if (error instanceof AuthError) {
          return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`);
        }
        throw error;
      }
    };

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="secondary"
        onClick={handleSignIn("github")}
        className="flex items-center justify-center gap-2"
      >
        <div className="flex flex-row gap-2 items-center">
          <GithubIcon className="text-foreground size-4" />
          <p>{t("continueWith.github")}</p>
        </div>
      </Button>

      <Button
        variant="secondary"
        onClick={handleSignIn("google")}
        className="flex items-center justify-center gap-2"
      >
        <div className="flex flex-row gap-2 items-center">
          <Google className="text-foreground size-4" />
          <p>{t("continueWith.google")}</p>
        </div>
      </Button>
      <div className="flex flex-row justify-between">
        <Button
          variant="ghost"
          type="button"
          onClick={() => router.push("/home")}
        >
          <ChevronLeft /> {t("home")}
        </Button>
        <Button variant="ghost">
          {t("signInWithEmail")}
          <ChevronRight />
        </Button>
      </div>
      {/* <div className="flex flex-row gap-2 items-center ">
        <span className="border-t flex-1 border-muted-foreground" />
        <p className="text-muted-foreground text-sm">{t("or")}</p>
        <span className="border-t flex-1 border-muted-foreground" />
      </div>
      <Button
        variant="outline"
        className="flex w-full items-center justify-center"
        disabled={isPending}
      >
        {isPending ? <Loader2 className="animate-spin" /> : null}
        {t("continueWith.email")}
      </Button> */}
      {/*
      <form action={action} className="space-y-4">
        <div className="flex flex-col gap-2">
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="name@example.com"
          />
        </div>

      </form> */}
      {state?.error && (
        <Alert variant={"destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>
            {translateMessage(tErrors, state.error)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
