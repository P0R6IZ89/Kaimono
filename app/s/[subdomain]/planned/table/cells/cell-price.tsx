import React from "react";
import { RowCellProps } from "./cell-profile";
import { formatPriceYen } from "@/util/formatPriceYen";

function PriceCell({ row }: RowCellProps) {
  const { price, description } = row.original;
  return (
    <div className="flex flex-col justify-between px-6 text-foreground">
      <p className="text-sm">{price ? formatPriceYen(price) : ""}</p>
      <p className="pt-2 line-clamp-2">{description}</p>
    </div>
  );
}

export default PriceCell;
