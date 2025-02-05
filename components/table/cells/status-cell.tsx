import { statuses } from "@/app/data/data";
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
    <div className="py-6 px-4">
      {status.icon && (
        <status.icon
          strokeWidth={1.3}
          size={24}
          className={`${status.color} ${status.bg} rounded-full`}
        />
      )}
    </div>
  );
};

export default StatusCell;
