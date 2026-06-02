import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function CreateWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
