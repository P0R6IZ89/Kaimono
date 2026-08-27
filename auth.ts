import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { createHash } from "node:crypto";
import prisma from "./lib/prisma";
import { rootDomainHost } from "./lib/variables";
import { checkDemoCreateRateLimit } from "./lib/rate-limit";

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

async function getUserRequiresTwoFactor(userId: string) {
  if (isEdge) return false;

  const twoFactor = await prisma.userTwoFactor.findUnique({
    where: { userId },
    select: { enabledAt: true },
  });

  return Boolean(twoFactor?.enabledAt);
}

function isExpiredDemo(expiresAt: string | null | undefined) {
  return !expiresAt || new Date(expiresAt).getTime() <= Date.now();
}

function getDemoRequestIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
  const source =
    forwardedFor?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("user-agent") ||
    "unknown";

  return createHash("sha256").update(source).digest("hex");
}

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  adapter: authAdapter,

  session: { strategy: "jwt" },

  providers: [
    ...authConfig.providers,
    ...(isEdge
      ? []
      : [
          Credentials({
            id: "demo",
            name: "Demo",
            credentials: { intent: {} },
            async authorize(credentials, request) {
              if (credentials.intent !== "showcase") return null;

              const rateLimit = await checkDemoCreateRateLimit(
                getDemoRequestIdentifier(request),
              );
              if (!rateLimit.success || (isProd && !rateLimit.enabled)) {
                return null;
              }

              try {
                const { createDemoGuest } = await import("@/lib/demo-guest");
                const demo = await createDemoGuest();

                return {
                  ...demo.user,
                  isDemo: true,
                  demoExpiresAt: demo.lease.expiresAt.toISOString(),
                  demoSubdomain: demo.workspace.subdomain,
                };
              } catch (error) {
                console.error("[demo-auth] Could not create demo guest", error);
                return null;
              }
            },
          }),
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
    async jwt({ token, user, trigger, session }) {
      if (!user && token.isDemo && isExpiredDemo(token.demoExpiresAt)) {
        return null;
      }

      if (user) {
        const userId = user.id as string;
        token.id = userId;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.image = user.image ?? token.image;
        token.isDemo = Boolean(user.isDemo);
        token.demoExpiresAt = user.demoExpiresAt ?? null;
        token.demoSubdomain = user.demoSubdomain ?? null;
        token.requiresTwoFactor = token.isDemo
          ? false
          : await getUserRequiresTwoFactor(userId);
        token.twoFactorVerified = !token.requiresTwoFactor;
        token.twoFactorVerifiedAt = token.requiresTwoFactor
          ? null
          : new Date().toISOString();
        return token;
      }

      if (!token.sub) return token;

      if (!isEdge && trigger === "update") {
        const twoFactorSession = session as
          | {
              requiresTwoFactor?: boolean;
              twoFactorVerified?: boolean;
              twoFactorVerifiedAt?: string | null;
            }
          | undefined;

        if (twoFactorSession?.requiresTwoFactor !== undefined) {
          token.requiresTwoFactor = twoFactorSession.requiresTwoFactor;
        }
        if (twoFactorSession?.twoFactorVerified !== undefined) {
          token.twoFactorVerified = twoFactorSession.twoFactorVerified;
        }
        if (twoFactorSession?.twoFactorVerifiedAt !== undefined) {
          token.twoFactorVerifiedAt = twoFactorSession.twoFactorVerifiedAt;
        }

        const { getUserById } = await import("./actions/authActions");
        const u = await getUserById(token.sub);
        if (u) {
          token.id = u.id;
          token.name = u.name ?? token.name;
          token.email = u.email ?? token.email;
          token.image = u.image ?? token.image;
        }
        if (twoFactorSession?.requiresTwoFactor === undefined) {
          token.requiresTwoFactor = await getUserRequiresTwoFactor(token.sub);
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
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      if (user.isDemo) return;

      const { createDemoTeamForUser } = await import("@/lib/demo-team-seed");
      const { grantSignupAiCredits } = await import("@/lib/ai-credits");
      await createDemoTeamForUser({
        id: user.id,
        name: user.name,
        email: user.email,
      });
      await grantSignupAiCredits(user.id);
    },
  },
});
export const { GET, POST } = handlers;
