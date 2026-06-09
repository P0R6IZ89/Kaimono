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

      return session;
    },
  },
});
