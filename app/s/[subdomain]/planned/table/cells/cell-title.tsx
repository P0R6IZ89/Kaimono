import React from "react";
import { RowCellProps } from "./cell-profile";

function TitleCell({ row }: RowCellProps) {
  const { title } = row.original;
  return (
    <div className="static top-8 left-8">
      <p className="font-semibold pt-4 pl-8">{title}</p>
    </div>
  );
}

export default TitleCell;
