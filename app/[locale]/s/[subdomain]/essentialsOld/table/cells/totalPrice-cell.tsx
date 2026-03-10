import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

type TotalPriceCellProps = {
  price: number;
  quantity: number;
  createdAt: string;
};

dayjs.extend(relativeTime);

export default function Quantity({ quantity }: TotalPriceCellProps) {
  return (
    <>
      {quantity !== 0 ? (
        <p className="tabular-nums slashed-zero">x {quantity}</p>
      ) : (
        <p className="tabular-nums slashed-zero">x 1</p>
      )}
    </>
  );
}
