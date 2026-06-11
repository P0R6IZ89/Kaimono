import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import {
  getAlternateOpenGraphLocales,
  getHomeLanguageAlternates,
  getHomeUrl,
  getOpenGraphLocale,
  getSocialImageUrl,
} from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const typedLocale: Locale = locale;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const title = t("title");
  const description = t("description");
  const canonicalUrl = getHomeUrl(typedLocale);
  const socialImageUrl = getSocialImageUrl(typedLocale);
  const socialImageAlt = t("socialImageAlt");

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: getHomeLanguageAlternates(),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      siteName: "Kaimono",
      locale: getOpenGraphLocale(typedLocale),
      alternateLocale: getAlternateOpenGraphLocales(typedLocale),
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          alt: socialImageAlt,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: socialImageUrl,
          alt: socialImageAlt,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <div>{children}</div>
    </SessionProvider>
  );
}
