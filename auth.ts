import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import authConfig from "./auth.config";
import Resend from "next-auth/providers/resend";
import { getAccountByUserId, getUserById } from "./actions/actions";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

// ←— Safe‐guard NEXTAUTH_URL:
const AUTH_URL =
  process.env.AUTH_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

// now this will always be a valid string
const ROOT_DOMAIN = new URL(AUTH_URL).hostname.split(".").slice(-2).join(".");

export const { handlers, signIn, signOut, auth } = NextAuth({
  // debug: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.FROM_EMAIL,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/error",
  },

  cookies: {
    csrfToken: {
      name: "__Secure-next-auth.csrf-token",
      options: {
        httpOnly: true, // client-side must read this
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: `.${ROOT_DOMAIN}`,
      },
    },
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: VERCEL_DEPLOYMENT
          ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
          : `.${ROOT_DOMAIN}`,
      },
    },
  },
  callbacks: {
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;
      const existingAccount = await getAccountByUserId(existingUser.id);
      token.isOauth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.image = existingUser.image;
      return token;
    },
    async session({ token, session }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          isOauth: token.isOauth,
        },
      };
    },
  },
});
export const { GET, POST } = handlers;
