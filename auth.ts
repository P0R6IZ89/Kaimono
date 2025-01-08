import NextAuth from "next-auth";
import { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";

const providers: Provider[] = [Google];

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  } else {
    return { id: provider.id, name: provider.name };
  }
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/signin",
    error: "/error",
  },
});
