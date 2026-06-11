import { routing, type Locale } from "@/i18n/routing";
import { protocol, rootDomain } from "@/lib/variables";

const openGraphLocales: Record<Locale, string> = {
  en: "en_US",
  ja: "ja_JP",
  pt: "pt_BR",
};

const languageTags: Record<Locale, string> = {
  en: "en",
  ja: "ja",
  pt: "pt-BR",
};

export const siteUrl = new URL(
  `${protocol}://${rootDomain.replace(/\/+$/, "")}`,
);

export function getHomePath(locale: Locale): string {
  return `/${locale}/home`;
}

export function getHomeUrl(locale: Locale): URL {
  return new URL(getHomePath(locale), siteUrl);
}

export function getHomeLanguageAlternates(): Record<string, string> {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [
      languageTags[locale],
      getHomePath(locale),
    ]),
  );

  return {
    ...languages,
    "x-default": getHomePath(routing.defaultLocale),
  };
}

export function getOpenGraphLocale(locale: Locale): string {
  return openGraphLocales[locale];
}

export function getAlternateOpenGraphLocales(locale: Locale): string[] {
  return routing.locales
    .filter((candidate) => candidate !== locale)
    .map((candidate) => openGraphLocales[candidate]);
}

export function getSocialImageUrl(locale: Locale): URL {
  return new URL(`/images/social/kaimono-${locale}.png`, siteUrl);
}
