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

import { createNavigation } from "next-intl/navigation";
import { Locale, routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
