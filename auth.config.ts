import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";

export const providers = [
  Github({
    clientId: process.env.AUTH_GITHUB_ID ?? process.env.GITHUB_CLIENT_ID,
    clientSecret:
      process.env.AUTH_GITHUB_SECRET ?? process.env.GITHUB_CLIENT_SECRET,
  }),
  Google({
    clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID,
    clientSecret:
      process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
  }),
] satisfies NextAuthConfig["providers"];

export const providerMap = providers
  .map((provider) => ({ id: provider.id, name: provider.name }))
  .filter((p) => p.id !== "credentials");

export default {
  providers,
} satisfies NextAuthConfig;
