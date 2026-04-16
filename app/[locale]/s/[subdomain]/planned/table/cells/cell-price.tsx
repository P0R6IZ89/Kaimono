import React from "react";
import { formatPriceYen } from "@/lib/formatPriceYen";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/[locale]/types/planned";

function PriceCell({ row }: { row: Row<PlannedSchema> }) {
  const { price, quantity } = row.original;

  return (
    <div className="flex flex-col justify-between px-4">
      <div className="flex items-baseline gap-2 text-muted-foreground text-xs slashed-zero tabular-nums">
        {price && <p>{formatPriceYen(price)}</p>}
        {quantity && <p>{`x${quantity}`}</p>}
      </div>
    </div>
  );
}

export default PriceCell;
