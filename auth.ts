import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import Resend from "next-auth/providers/resend";
import prisma from "./lib/prisma";
import { rootDomainHost } from "./lib/variables";

const isEdge = process.env.NEXT_RUNTIME === "edge";
export const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;
const isProd = process.env.NODE_ENV === "production";

const cookieDomain = isProd
  ? rootDomainHost
    ? `.${rootDomainHost}`
    : process.env.VERCEL_URL
      ? `.${process.env.VERCEL_URL}`
      : undefined
  : undefined;

const authAdapter = isEdge
  ? undefined
  : PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: authAdapter,

  session: { strategy: "jwt" },

  providers: [
    ...authConfig.providers,
    ...(isEdge
      ? []
      : [
          Resend({
            apiKey: process.env.AUTH_RESEND_KEY,
            from: process.env.LOGIN_FROM_EMAIL,
          }),
        ]),
  ],
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },

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
    async jwt({ token, user, trigger }) {
      if (!token.sub) return token;

      if (user) {
        token.id = user.id as string;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.image = user.image ?? token.image;
        return token;
      }
      if (!isEdge && trigger === "update") {
        const { getUserById } = await import("./actions/authActions");
        const u = await getUserById(token.sub);
        if (u) {
          token.id = u.id;
          token.name = u.name ?? token.name;
          token.email = u.email ?? token.email;
          token.image = u.image ?? token.image;
        }
        return token;
      }
      // Always return a JWT object or null
      return token ?? null;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.name) session.user.name = token.name as string;
      if (token.email) session.user.email = token.email as string;
      if (token.picture) session.user.image = token.picture as string;

      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;

      const { createDemoTeamForUser } = await import("@/lib/demo-team-seed");
      await createDemoTeamForUser({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    },
  },
});
export const { GET, POST } = handlers;
