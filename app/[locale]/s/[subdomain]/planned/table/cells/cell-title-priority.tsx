import React from "react";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { formatPriceYen } from "@/lib/formatPriceYen";

function TitleCell({ row }: { row: Row<PlannedSchema> }) {
  const { title, price, quantity } = row.original;
  const totalPrice = React.useMemo(() => price * quantity, [price, quantity]);
  return (
    <div className="flex justify-between px-4 text-lg tracking-wider">
      <p>{title}</p>
      <p className="slashed-zero tabular-nums">{formatPriceYen(totalPrice)}</p>
    </div>
  );
}

export default TitleCell;
