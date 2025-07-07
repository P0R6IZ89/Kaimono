import React from "react";
import { RowCellProps } from "./cell-profile";
import { Badge } from "@/components/ui/badge";

function StatusCell({ row }: RowCellProps) {
  const { status } = row.original;
  return (
    <div className="absolute top-4 right-4 z-10">
      <Badge variant={"outline"}>{status}</Badge>
    </div>
  );
}

export default StatusCell;
