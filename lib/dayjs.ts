import dayjs, { Dayjs } from "dayjs";

import localizedFormat from "dayjs/plugin/localizedFormat"; // e.g. 'LL', 'LLL'
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export async function ensureLocale(locale: string) {
  if (locale && locale !== "en") {
    await import(`dayjs/locale/${locale}.js`).catch(() => {});
  }
}

export function formatDate(
  date: string | number | Date | Dayjs,
  fmt: string,
  locale: string,
  options?: { timeZone?: string }
) {
  let d = dayjs(date);
  if (options?.timeZone) d = d.tz(options.timeZone);
  return d.locale(locale).format(fmt);
}

export default dayjs;
