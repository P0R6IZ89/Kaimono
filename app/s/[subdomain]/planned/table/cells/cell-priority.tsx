import React from "react";
import { RowCellProps } from "./cell-profile";

function PriorityCell({ row }: RowCellProps) {
  const { priority } = row.original;
  return (
    <div className="static flex flex-none top-8 left-8 text-foreground">
      <p className="font-semibold pt-4 pl-8">{priority}</p>
    </div>
  );
}

export default PriorityCell;
