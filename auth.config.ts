import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";

export const providers = [
  Github({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }),
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
] satisfies NextAuthConfig["providers"];

export const providerMap = providers
  .map((provider) => ({ id: provider.id, name: provider.name }))
  .filter((p) => p.id !== "credentials");

export default {
  providers,
} satisfies NextAuthConfig;
