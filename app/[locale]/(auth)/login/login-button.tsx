"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import { AuthError } from "next-auth";
import React from "react";
import { GithubIcon, Google } from "@/lib/oauth-icon";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

const SIGNIN_ERROR_URL = "/error";

interface SignInProps {
  callbackUrl?: string;
}

export default function SignInButtons({ callbackUrl }: SignInProps) {
  const router = useRouter();
  const t = useTranslations("Auth");

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
        onClick={handleSignIn("google")}
        className="flex items-center justify-center gap-2"
      >
        <div className="flex flex-row gap-2 items-center">
          <Google className="text-foreground size-4" />
          <p>{t("continueWith.google")}</p>
        </div>
      </Button>
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

      <div className="flex flex-row justify-between">
        <Button
          variant="ghost"
          type="button"
          onClick={() => router.push("/home")}
        >
          <ChevronLeft /> {t("home")}
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={() => {
            const params = new URLSearchParams();
            if (callbackUrl) params.set("callbackUrl", callbackUrl);
            const query = params.toString();
            router.push(`/login/magic-link${query ? `?${query}` : ""}`);
          }}
        >
          {t("signInWithEmail")}
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
