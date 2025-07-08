import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextRequest, NextResponse } from "next/server";
import { publicPaths, rootDomain } from "./lib/utils";

const KILL_SWITCH = process.env.KILL_SWITCH === "true";

const { auth } = NextAuth(authConfig);

function extractSubdomain(req: NextRequest): string | null {
  const url = req.url;
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Local development environment
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(":")[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

export default auth(async function middleware(req) {
  if (KILL_SWITCH) {
    return new NextResponse("Service Unavailable", { status: 503 });
  }

  const { pathname, search } = req.nextUrl;
  const subdomain = extractSubdomain(req);
  const user = req.auth?.user;

  // Auth logic
  if (!subdomain) {
    // const session = true;
    if (!user && pathname !== "/login" && !publicPaths.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", req.url));
    } else if (user && pathname == "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (subdomain) {
    // For the root path on a subdomain, rewrite to the subdomain page
    if (pathname === "/") {
      return NextResponse.rewrite(new URL(`/s/${subdomain}`, req.url));
    } else {
      const dest = new URL(`/s/${subdomain}${pathname}`, req.url);
      dest.search = search;
      return NextResponse.rewrite(dest);
    }
  }

  // On the root domain, allow normal access
  return NextResponse.next();
});

export const config = {
  /*
   * Match all paths except for:
   * 1. /api routes
   * 2. /_next (Next.js internals)
   * 3. all root files inside /public (e.g. /favicon.ico)
   */
  matcher: ["/((?!api|_next|[\\w-]+\\.\\w+).*)"],
};
