import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { rootDomainHost } from "@/util/utils";

const isProd = process.env.NODE_ENV === "production";

const resolvedCookieDomain = (
  rootDomainHost || process.env.VERCEL_URL?.split(":")[0]
)?.replace(/^\./, "");
const shouldShareCookieAcrossSubdomains =
  !!resolvedCookieDomain &&
  resolvedCookieDomain !== "localhost" &&
  resolvedCookieDomain !== "127.0.0.1";
const cookieDomain = shouldShareCookieAcrossSubdomains
  ? resolvedCookieDomain
  : undefined;

export const { auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  pages: { signIn: "/login", signOut: "/logout" },
  cookies: {
    sessionToken: {
      name: isProd ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        domain: cookieDomain,
      },
    },
  },
});
