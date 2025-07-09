"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import { AuthError } from "next-auth";
import React, { useActionState } from "react";
import { GithubIcon, Google } from "@/util/oauth-icon";
import { Input } from "@/components/ui/input";
import { magicLinkSignIn } from "@/actions/authActions";
import { Loader2 } from "lucide-react";

const SIGNIN_ERROR_URL = "/error";

interface SignInProps {
  callbackUrl?: string;
}

export default function SignInButtons({ callbackUrl }: SignInProps) {
  const router = useRouter();

  const [, action, isPending] = useActionState(magicLinkSignIn, undefined);

  const handleSignIn =
    (providerId: string) => async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        const result = await signIn(providerId, {
          redirectTo: callbackUrl,
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
        variant="default"
        onClick={handleSignIn("github")}
        className="flex items-center justify-center gap-2"
      >
        <div className="flex flex-row gap-2 items-center">
          <GithubIcon className="text-background size-4" />
          <p>Continuar com Github</p>
        </div>
      </Button>

      <Button
        variant="default"
        onClick={handleSignIn("google")}
        className="flex items-center justify-center gap-2"
      >
        <div className="flex flex-row gap-2 items-center">
          <Google className="text-foreground size-4" />
          <p>Continuar com Google</p>
        </div>
      </Button>
      <div className="flex flex-row gap-2 items-center ">
        <span className="border-t w-full border-muted-foreground" />
        <p className="text-muted-foreground">ou</p>
        <span className="border-t w-full border-muted-foreground" />
      </div>
      <form action={action} className="space-y-4">
        <div className="flex flex-col gap-2">
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="name@example.com"
          />
        </div>

        <Button
          className="flex w-full items-center justify-center"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Continuar com Email
        </Button>
      </form>
    </div>
  );
}
