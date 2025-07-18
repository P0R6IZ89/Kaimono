import React from "react";
import { RowCellProps } from "./cell-profile";
import { formatPriceYen } from "@/util/formatPriceYen";

function PriceCell({ row }: RowCellProps) {
  const { price, description } = row.original;
  return (
    <div className="flex flex-col justify-between px-3 text-foreground">
      <p className="text-sm leading-3">{price ? formatPriceYen(price) : ""}</p>
      <p className="text-base/5 pt-4">{description}</p>
    </div>
  );
}

export default PriceCell;
