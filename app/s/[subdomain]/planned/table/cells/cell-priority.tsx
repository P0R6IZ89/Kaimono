import { PlannedSchema } from "@/app/types/planned";
import { Row } from "@tanstack/react-table";
import React from "react";

function PriorityCell(row: Row<PlannedSchema>) {
  const { priority } = row.original;
  return (
    <div className="static flex flex-none top-8 left-8 text-foreground">
      <p
        className={`font-semibold pt-4 pl-8 ${
          priority === "HIGH" ? "text-destructive" : ""
        } 
     `}
      >
        {priority}
      </p>
    </div>
  );
}

export default PriorityCell;
