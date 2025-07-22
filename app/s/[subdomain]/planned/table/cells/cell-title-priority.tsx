import React from "react";
import { RowCellProps } from "./cell-profile";
import { Badge } from "@/components/ui/badge";

function TitleCell({ row }: RowCellProps) {
  const { title, priority } = row.original;
  return (
    <div className="static flex justify-between top-8 px-3 text-foreground">
      <p className="text-lg font-semibold">{title}</p>
      <Badge
        variant={"outline"}
        className={`${
          priority === "high" ? "text-destructive border-destructive" : null
        }`}
      >
        {priority}
      </Badge>
    </div>
  );
}

export default TitleCell;
