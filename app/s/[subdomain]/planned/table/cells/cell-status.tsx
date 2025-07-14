import React from "react";
import { RowCellProps } from "./cell-profile";
import { Badge } from "@/components/ui/badge";

function StatusCell({ row }: RowCellProps) {
  const { status } = row.original;
  return (
    <div className="dark absolute top-4 right-4 z-10 text-foreground">
      <Badge variant={"outline"}>{status}</Badge>
    </div>
  );
}

export default StatusCell;
