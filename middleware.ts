import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { auth } from "@/auth-edge";
import { Locale } from "next-intl";
import { publicPaths, rootDomainHost } from "./lib/variables";
import { extractSubdomainFromHost } from "./lib/subdomain";

const KILL_SWITCH = process.env.KILL_SWITCH;
const LOCALE_HEADER = "X-NEXT-INTL-LOCALE";

const isLocale = (l: string): l is Locale =>
  (routing.locales as readonly string[]).includes(l);

function isPathLocalized(pathname: string): boolean {
  return routing.locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
}

export function stripLeadingLocale(pathname: string): {
  locale: Locale;
  rest: string;
} {
  const [, maybeLocale, ...restParts] = pathname.split("/");
  const locale = isLocale(maybeLocale ?? "")
    ? (maybeLocale as Locale)
    : routing.defaultLocale;

  const joined = restParts.join("/");
  const rest = isLocale(maybeLocale ?? "")
    ? joined
      ? `/${joined}`
      : "/"
    : pathname || "/";
  return { locale, rest };
}

const handleI18nRouting = createIntlMiddleware(routing);

function getLocaleHeaders(req: NextRequest, locale: Locale) {
  const headers = new Headers(req.headers);
  headers.set(LOCALE_HEADER, locale);
  return headers;
}

function getSafeCallbackPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function isDemoRestrictedPath(pathname: string) {
  return (
    pathname === "/new-workspace" ||
    pathname === "/new-team" ||
    pathname === "/invite" ||
    pathname.startsWith("/invite/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/two-factor"
  );
}

export default auth(async function middleware(req) {
  if (KILL_SWITCH) {
    return new NextResponse("Service Unavailable", { status: 503 });
  }

  const { pathname, search } = req.nextUrl;

  if (!isPathLocalized(pathname)) {
    return handleI18nRouting(req);
  }

  const { locale, rest } = stripLeadingLocale(pathname);
  const subdomain = extractSubdomainFromHost({
    host: req.headers.get("host") ?? "",
    rootDomainHost,
  });
  const localeHeaders = getLocaleHeaders(req, locale);

  const user = req.auth?.user;
  const isPublic = publicPaths.includes(rest);
  const isLoginPath = rest === "/login" || rest === "/login/magic-link";
  const isTwoFactorPath = rest === "/two-factor";
  const requiresTwoFactor = Boolean(req.auth?.requiresTwoFactor);
  const twoFactorVerified =
    !requiresTwoFactor || Boolean(req.auth?.twoFactorVerified);

  if (!user && !isLoginPath && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  if (user && isTwoFactorPath && twoFactorVerified) {
    const fallback = `/${locale}/`;
    const callbackPath = getSafeCallbackPath(
      req.nextUrl.searchParams.get("callbackUrl"),
      fallback,
    );
    const callbackUrl = new URL(callbackPath, req.nextUrl.origin);
    const url = req.nextUrl.clone();
    url.pathname = callbackUrl.pathname;
    url.search = callbackUrl.search;
    return NextResponse.redirect(url);
  }

  if (user && requiresTwoFactor && !twoFactorVerified && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/two-factor`;
    url.search = "";
    url.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (user && isLoginPath) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  if (user && req.auth?.isDemo && isDemoRestrictedPath(rest)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (subdomain && !isPublic) {
    const expectedPrefix = `/${locale}/s/${subdomain}`;
    if (!pathname.startsWith(expectedPrefix)) {
      const dest = req.nextUrl.clone();
      dest.pathname = `${expectedPrefix}${rest === "/" ? "" : rest}`;
      dest.search = search;
      return NextResponse.rewrite(dest, {
        request: { headers: localeHeaders },
      });
    }
  }

  return NextResponse.next({ request: { headers: localeHeaders } });
});

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
