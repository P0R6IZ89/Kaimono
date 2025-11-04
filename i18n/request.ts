import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { hasLocale } from "next-intl";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const activeLocale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale: activeLocale,
    messages: (await import(`../locales/${activeLocale}.json`)).default,
  };
});
