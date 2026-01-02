import React from "react";
import { formatPriceYen } from "@/util/formatPriceYen";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

type TotalPriceCellProps = {
  price: number;
  quantity: number;
  createdAt: string;
};

dayjs.extend(relativeTime);

export default function TotalPrice({ price, quantity }: TotalPriceCellProps) {
  const totalPrice = price * quantity;
  const formatedPrice = formatPriceYen(totalPrice);
  return (
    <p className="flex-none text-base font-semibold tabular-nums">
      {formatedPrice}
    </p>
  );
}
