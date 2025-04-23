import authConfig from "./auth.config";
import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const url = req.nextUrl;

  // Gets the host (e.g., demo.localhost:3000).
  // Replaces .localhost:3000 with your production root domain (.yourdomain.com).
  const hostHeader = req.headers.get("host")!; 
  console.log('⚠️ hostHeader →', hostHeader)          
  let [hostname] = hostHeader.split(":");
  console.log('⚠️ hostname →', hostname)      
  // let hostname = req.headers
  //   .get("host")!
  //   .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

  // special case for Vercel preview deployment URLs
  // "demo---feature.vercel.app" to "demo.yourdomain.com"
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${
      process.env.NEXT_PUBLIC_ROOT_DOMAIN
    }`;
  }

  // Constructs the full path (e.g., /about?page=2).
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // Rewrites for app pages
  // 1. Not logged in and not on /signin → redirect to /signin
  // 2. Already logged in but on /signin → redirect to /
  // 3. Else: serve content from /app/*
  if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    console.log("✅ ",hostname, "=", `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);
    const session = await getToken({ req });
    if (!session && path !== "/signin") {
      console.log("✅ Not logged in and not on /signin → redirect to /signin")
      return NextResponse.redirect(new URL("/signin", req.url));
    } else if (session && path == "/signin") {
      console.log("✅ Already logged in but on /signin → redirect to /")
      return NextResponse.redirect(new URL("/", req.url));
    }
    console.log("✅  Else: serve content from /app/*")
    return NextResponse.rewrite(
      new URL(`/app${path === "/" ? "" : path}`, req.url)
    );
  }

  // Rewrite root application to `/home` folder
  if (
    hostname === "localhost" ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    console.log("✅ Rewrite root application to `/home` folder")
    return NextResponse.rewrite(
      
      new URL(`/home${path === "/" ? "" : path}`, req.url)
    );
  }
  // Rewrite everything else to `/[domain]/[slug] dynamic route
  console.log("⚠️ Rewrite everything else to `/[domain]/[slug] dynamic route")
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
});

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};
