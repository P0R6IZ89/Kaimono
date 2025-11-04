import { NextRequest } from "next/server";
import { match as localeMatch } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { routing } from "@/i18n/routing";

// export const locales = ["en", "pt", "ja"] as const;
const locales = routing.locales;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function hasLocalePrefix(pathname: string) {
  console.log("hasLocalePrefix", pathname);
  return locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
}
export function stripLocale(pathname: string) {
  const maybe = pathname.split("/")[1];
  console.log("stripLocale", { pathname, maybe });
  if ((locales as readonly string[]).includes(maybe)) {
    const rest = pathname.slice(maybe.length + 1) || "/";
    console.log("stripLocale", { pathname, maybe, rest });
    return {
      locale: maybe as Locale,
      rest: rest.startsWith("/") ? rest : `/${rest}`,
    };
  }
  return { locale: null, rest: pathname || "/" };
}

export function negotiateLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value as Locale | undefined;
  if (cookie && locales.includes(cookie)) {
    console.log("negotiateLocale from cookie", cookie);
    return cookie;
  }
  const accept = req.headers.get("accept-language") ?? "";
  const requested: string[] = new Negotiator({
    headers: { "accept-language": accept },
  }).languages();
  if (!requested || requested.length === 0) {
    console.log("negotiateLocale no requested, using default", defaultLocale);
    return defaultLocale;
  }
  const matched = localeMatch(
    requested,
    locales as readonly string[],
    defaultLocale
  );
  console.log("negotiateLocale matched", { requested, matched });
  return (locales as readonly string[]).includes(matched)
    ? (matched as Locale)
    : defaultLocale;
}
