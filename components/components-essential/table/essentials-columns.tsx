"use client";

import { ColumnDef } from "@tanstack/react-table";
import StatusCell from "./cells/status-cell";
import TitleCell from "./cells/title-cell";
import TotalPrice from "./cells/totalPrice-cell";
import ActionCell from "./cells/action-cell";

export interface TableRowData {
  id: string;
  title: string;
  price: number;
  status: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export const columns: ColumnDef<TableRowData>[] = [
  {
    accessorKey: "status",
    header: () => null,
    cell: StatusCell,
  },
  {
    accessorKey: "title",
    id: "title",
    header: () => null,
    cell: (info) => {
      const { price, quantity, createdAt } = info.row.original;
      const title = info.getValue<string>();
      return (
        <TitleCell
          title={title}
          price={price}
          quantity={quantity}
          createdAt={createdAt}
        />
      );
    },
  },
  {
    id: "totalPrice",
    header: () => null,
    cell: (info) => {
      const { price, quantity, createdAt } = info.row.original;
      return (
        <TotalPrice price={price} quantity={quantity} createdAt={createdAt} />
      );
    },
  },
  {
    id: "action",
    header: () => null,
    cell: ActionCell,
  },
];
