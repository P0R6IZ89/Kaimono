import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { formatPriceYen } from "@/util/FormatPriceYen";

type TitleCellProps = {
  title: string;
  price: number;
  quantity: number;
  createdAt: string;
};

dayjs.extend(relativeTime);

export default function TitleCell({
  title,
  price,
  quantity,
  createdAt,
}: TitleCellProps) {
  return (
    <div className="flex flex-col justify-between items-baseline">
      <p className="text-xs text-muted-foreground">
        {dayjs(createdAt).fromNow()}
      </p>
      <p>{title}</p>
      <div className="flex flex-row gap-2 mt-1 text-xs text-muted-foreground">
        <p>Qnt:{quantity}</p>
        <p>{formatPriceYen(price)}</p>
      </div>
    </div>
  );
}
