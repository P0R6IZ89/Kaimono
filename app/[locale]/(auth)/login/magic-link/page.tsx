import { getTranslations } from "next-intl/server";
import MagicLinkForm from "./magic-link-form";

interface MagicLinkPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function MagicLinkPage({
  searchParams,
}: MagicLinkPageProps) {
  const { callbackUrl } = await searchParams;
  const t = await getTranslations("Login");

  return (
    <div className="flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 m-auto">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <div className="mt-4 w-full">
        <MagicLinkForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
