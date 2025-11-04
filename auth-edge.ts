import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
});
