import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { rootDomainHost } from "./lib/variables";

const isProd = process.env.NODE_ENV === "production";

const cookieDomain = isProd
  ? rootDomainHost
    ? `.${rootDomainHost}`
    : process.env.VERCEL_URL
      ? `.${process.env.VERCEL_URL}`
      : undefined
  : undefined;

function isExpiredDemo(expiresAt: string | null | undefined) {
  return !expiresAt || new Date(expiresAt).getTime() <= Date.now();
}

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
  callbacks: {
    async jwt({ token }) {
      if (token.isDemo && isExpiredDemo(token.demoExpiresAt)) {
        return null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.name) session.user.name = token.name as string;
      if (token.email) session.user.email = token.email as string;
      if (token.image) session.user.image = token.image as string;
      if (token.picture) session.user.image = token.picture as string;

      session.requiresTwoFactor = Boolean(token.requiresTwoFactor);
      session.twoFactorVerified =
        !session.requiresTwoFactor || Boolean(token.twoFactorVerified);
      session.twoFactorVerifiedAt =
        typeof token.twoFactorVerifiedAt === "string"
          ? token.twoFactorVerifiedAt
          : null;
      session.isDemo = Boolean(token.isDemo);
      session.demoExpiresAt =
        typeof token.demoExpiresAt === "string" ? token.demoExpiresAt : null;
      session.demoSubdomain =
        typeof token.demoSubdomain === "string" ? token.demoSubdomain : null;

      return session;
    },
  },
});
