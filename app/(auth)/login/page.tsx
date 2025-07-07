import SignIn from "./login-button";
import { Suspense } from "react";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  return (
    <div className=" flex flex-col gap-4 min-h-dvh max-w-lg m-auto justify-center items-center pl-8 pr-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Bem vindo! ✨</h1>
        <p className="text-muted-foreground">
          Escolha como você deseja fazer login.
        </p>
      </div>
      <div className="mt-4">
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
