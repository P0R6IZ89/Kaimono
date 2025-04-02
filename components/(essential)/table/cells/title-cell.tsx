import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { formatPriceYen } from "@/util/FormatPriceYen";

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
  const daysOld = dayjs().diff(createdAt, "day");
  const timeClass = daysOld > 7 ? "text-red-500" : "text-muted-foreground";
  return (
    <div className="flex flex-col justify-between items-baseline">
      <p className="text-xs text-muted-foreground">{user.name}</p>
      <p>{title}</p>
      <div className="flex flex-row gap-2 mt-1 text-xs text-muted-foreground">
        <p>{formatPriceYen(price)}</p>
        <p>x{quantity}</p>
        <p className={`text-xs ${timeClass}`}>{dayjs(createdAt).fromNow()}</p>
      </div>
    </div>
  );
}
