import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { formatPriceYen } from "@/util/formatPriceYen";
import { useFormatter, useNow } from "next-intl";

type TitleCellProps = {
  title: string;
  price: number;
  quantity: number;
  createdAt: string;
  user: {
    name: string;
  };
};

dayjs.extend(relativeTime);

export default function TitleCell({
  user,
  price,
  title,
  quantity,
  createdAt,
}: TitleCellProps) {
  const format = useFormatter();
  const now = useNow();
  const createdDate = new Date(createdAt);

  const daysOld = dayjs(now).diff(createdDate, "day");
  const timeClass = daysOld > 7 ? "text-red-500" : "text-muted-foreground";
  const fromNowText = format.relativeTime(createdDate, now);

  return (
    <div className="flex-1 min-w-0 w-0 overflow-hidden">
      <p className="text-xs text-muted-foreground">{user.name}</p>
      <p className="text-lg font-semibold truncate">{title}</p>
      <div className="flex flex-row gap-3 mt-1 text-xs text-muted-foreground">
        <p className={`${timeClass} flex-none`}>{fromNowText}</p>
        <div className="flex flex-row gap-1">
          <p className="tabular-nums">{formatPriceYen(price)}</p>
          <p>x{quantity}</p>
        </div>
      </div>
    </div>
  );
}
