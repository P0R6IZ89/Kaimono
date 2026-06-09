export const protocol =
  process.env.NODE_ENV === "production" ? "https" : "http";

export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

export const rootDomainHost = rootDomain.split(":")[0];

export const publicPaths = [
  "/login",
  "/login/magic-link",
  "/home",
  "/logout",
  "/welcome",
  "/two-factor",
  "/api/auth",
];

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase();
}
