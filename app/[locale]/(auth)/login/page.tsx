import { getTranslations } from "next-intl/server";
import SignIn from "./login-button";
import { Suspense } from "react";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const t = await getTranslations("Login");
  return (
    <div className="flex flex-col gap-4 px-4 min-h-dvh max-w-lg m-auto justify-center items-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <div className="mt-4 w-full">
        <Suspense
          fallback={
            <div className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800" />
          }
        >
          <SignIn callbackUrl={callbackUrl} />
        </Suspense>
      </div>
    </div>
  );
}
