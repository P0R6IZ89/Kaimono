import type { NextAuthConfig } from "next-auth";
import { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";

const providers: Provider[] = [Github, Google];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

export default {
  providers,
} satisfies NextAuthConfig;
