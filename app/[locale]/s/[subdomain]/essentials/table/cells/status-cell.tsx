import { statuses } from "@/data/data";
import { Row } from "@tanstack/react-table";
import React from "react";
import { TableRowData } from "../essentials-columns";

interface StatusCellProps {
  row: Row<TableRowData>;
}

const StatusCell: React.FC<StatusCellProps> = ({ row }) => {
  const status = statuses.find(
    (status) => status.value === row.getValue("status")
  );
  if (!status) return null;
  return (
    <div className="">
      {status.icon && (
        <status.icon
          strokeWidth={1.3}
          size={24}
          className={`${status.color} rounded-full`}
        />
      )}
    </div>
  );
};

export default StatusCell;
