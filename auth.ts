import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import authConfig from "./auth.config";
import Resend from "next-auth/providers/resend";
import { getUserById } from "./actions/actions";

export const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

export const { handlers, signIn, signOut, auth } = NextAuth({
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
    sessionToken: {
      name: VERCEL_DEPLOYMENT
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
      options: {
        httpOnly: VERCEL_DEPLOYMENT,
        sameSite: "lax",
        path: "/",
        secure: VERCEL_DEPLOYMENT,
        // This is an arrangement for the browser to accept the subdomain on localhost
        // It does not works with firefox
        domain: VERCEL_DEPLOYMENT ? "" : ".localhost",
      },
    },
  },
  callbacks: {
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      token.id = existingUser.id;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.image = existingUser.image;
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      session.user.image = token.image as string;

      return session;
    },
  },
});
export const { GET, POST } = handlers;
