import React from "react";
import { RowCellProps } from "./cell-profile";
import { formatPriceYen } from "@/util/formatPriceYen";

function PriceCell({ row }: RowCellProps) {
  const { price, description } = row.original;
  if (!price) {
    return null;
  }
  return (
    <div className="flex flex-col justify-between px-3 text-foreground">
      <div className="flex flex-row gap-2">
        <p className="text-sm leading-3 font-semibold">
          {formatPriceYen(price)}
        </p>
        <p className="text-xs text-muted-foreground">{`${formatPriceYen(price)} x2`}</p>
      </div>
      <p className="text-sm/5 pt-4">{description}</p>
    </div>
  );
}

export default PriceCell;
