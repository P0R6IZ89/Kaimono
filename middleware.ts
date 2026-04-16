import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { auth } from "@/auth-edge";
import { Locale } from "next-intl";
import { publicPaths, rootDomainHost } from "./lib/variables";

const KILL_SWITCH = process.env.KILL_SWITCH;
const LOCALE_HEADER = "X-NEXT-INTL-LOCALE";

function extractSubdomain(req: NextRequest): string | null {
  const url = req.url;
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Local dev
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch?.[1]) return fullUrlMatch[1];
    if (hostname.includes(".localhost")) return hostname.split(".")[0];
    return null;
  }

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainHost &&
    hostname !== `www.${rootDomainHost}` &&
    hostname.endsWith(`.${rootDomainHost}`);

  return isSubdomain ? hostname.replace(`.${rootDomainHost}`, "") : null;
}

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

export default auth(async function middleware(req) {
  if (KILL_SWITCH) {
    return new NextResponse("Service Unavailable", { status: 503 });
  }

  const { pathname, search } = req.nextUrl;

  if (!isPathLocalized(pathname)) {
    return handleI18nRouting(req);
  }

  const { locale, rest } = stripLeadingLocale(pathname);
  const subdomain = extractSubdomain(req);
  const localeHeaders = getLocaleHeaders(req, locale);

  const user = req.auth?.user;
  const isPublic = publicPaths.includes(rest);

  if (!user && rest !== "/login" && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  if (user && rest === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  if (subdomain) {
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
