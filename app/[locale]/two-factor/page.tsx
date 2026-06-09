import { auth } from "@/auth";
import { getCurrentLocale, redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import TwoFactorForm from "./two-factor-form";

type TwoFactorPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function TwoFactorPage({
  searchParams,
}: TwoFactorPageProps) {
  const session = await auth();
  const locale = await getCurrentLocale();
  const { callbackUrl } = await searchParams;

  if (!session?.user?.id) {
    redirect({ href: "/login", locale });
  }

  const authenticatedSession = session as NonNullable<typeof session>;

  if (
    !authenticatedSession.requiresTwoFactor ||
    authenticatedSession.twoFactorVerified
  ) {
    redirect({ href: "/", locale });
  }

  const t = await getTranslations("TwoFactor");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("challenge.title")}
        </h1>
        <p className="text-muted-foreground">{t("challenge.description")}</p>
      </div>
      <TwoFactorForm callbackUrl={callbackUrl} />
    </div>
  );
}
