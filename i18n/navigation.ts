// import { createNavigation } from "next-intl/navigation";
// import { Locale, routing } from "./routing";
import { getLocale } from "next-intl/server";

export async function getCurrentLocale(): Promise<Locale> {
  try {
    return (await getLocale()) as Locale;
  } catch {
    return routing.defaultLocale as Locale;
  }
}

// const nav = createNavigation(routing);

// export const { Link, usePathname, useRouter, getPathname } = nav;

// type RedirectArgs = Parameters<typeof nav.redirect>[0];
// type PermanentRedirectArgs = Parameters<typeof nav.permanentRedirect>[0];

// export function redirect(args: RedirectArgs): never {
//   (nav.redirect as (a: RedirectArgs) => void)(args);
//   throw new Error("REDIRECT"); // unreachable; informs TS this never returns
// }

// export function permanentRedirect(args: PermanentRedirectArgs): never {
//   (nav.permanentRedirect as (a: PermanentRedirectArgs) => void)(args);
//   throw new Error("REDIRECT"); // unreachable
// }

import { createNavigation } from "next-intl/navigation";
import { Locale, routing } from "./routing";

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
