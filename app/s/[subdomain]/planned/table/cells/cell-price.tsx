import React from "react";
import { RowCellProps } from "./cell-profile";
import { formatPriceYen } from "@/util/formatPriceYen";

function PriceCell({ row }: RowCellProps) {
  const { price, description, quantity } = row.original;
  if (!price) {
    return null;
  }
  const totalPrice = price * quantity;
  return (
    <div className="flex flex-col justify-between px-4 text-foreground">
      <div className="flex items-baseline gap-2">
        <p className="text-sm leading-3 font-semibold">
          {formatPriceYen(totalPrice)}
        </p>
        {quantity !== 1 ? (
          <p className="text-xs text-muted-foreground">{`${formatPriceYen(price)} x${quantity}`}</p>
        ) : null}
      </div>
      <p className="text-sm/5 pt-4 leading-tight">{description}</p>
    </div>
  );
}

export default PriceCell;
