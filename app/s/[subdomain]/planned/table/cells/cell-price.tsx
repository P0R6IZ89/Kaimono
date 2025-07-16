import React from "react";
import { RowCellProps } from "./cell-profile";
import { formatPriceYen } from "@/util/formatPriceYen";

function PriceCell({ row }: RowCellProps) {
  const { price, description } = row.original;
  return (
    <div className="flex flex-col justify-between px-3 text-foreground">
      <p className="text-sm">{price ? formatPriceYen(price) : ""}</p>
      <p className="">{description}</p>
    </div>
  );
}

export default PriceCell;
