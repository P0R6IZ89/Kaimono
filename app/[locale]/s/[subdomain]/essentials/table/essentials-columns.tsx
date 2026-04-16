"use client";

import { ColumnDef } from "@tanstack/react-table";
import StatesCell from "./cells/status-cell";
import TitleCell from "./cells/title-cell";
import ActionCell from "./cells/action-cell";
import { Status } from "@prisma/client";
import Quantity from "./cells/totalPrice-cell";

export interface TableRowData {
  id: string;
  title: string;
  price: number;
  status: Status;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
}

export const columns: ColumnDef<TableRowData>[] = [
  {
    accessorKey: "status",
    header: () => null,
    cell: StatesCell,
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "title",
    id: "title",
    header: () => null,
    cell: (info) => {
      const { price, quantity, createdAt, user } = info.row.original;
      const title = info.getValue<string>();
      return (
        <TitleCell
          title={title}
          price={price}
          quantity={quantity}
          createdAt={createdAt}
          user={user}
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
        <Quantity price={price} quantity={quantity} createdAt={createdAt} />
      );
    },
  },
  {
    id: "action",
    header: () => null,
    cell: ActionCell,
  },
  {
    accessorKey: "createdAt",
    id: "createdAt",
    cell: () => null,
  },
];
