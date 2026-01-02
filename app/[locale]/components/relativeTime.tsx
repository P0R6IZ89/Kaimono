"use client";

import { useFormatter, useNow } from "next-intl";
import { useMemo } from "react";

export function RelativeTime({ date }: { date: string | number | Date }) {
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 }); // Update every minute

  const text = useMemo(() => {
    return format.relativeTime(new Date(date), now);
  }, [date, now, format]);

  return <>{text}</>;
}
