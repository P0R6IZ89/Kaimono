"use client";

import { ColumnDef } from "@tanstack/react-table";
import { priorities, statuses } from "@/app/data/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreHorizontal } from "lucide-react";

export type ToBuy = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  status: "pending" | "purchased" | "canceled";
  priority: "low" | "medium" | "high";
};

export const columns: ColumnDef<ToBuy>[] = [
  {
    accessorKey: "priority",
    sortingFn: (rowA, rowB, columnId) => {
      const priorityOrder = { low: 1, medium: 2, high: 3 };
      const aValue =
        priorityOrder[rowA.getValue(columnId) as ToBuy["priority"]] || 0;
      const bValue =
        priorityOrder[rowB.getValue(columnId) as ToBuy["priority"]] || 0;
      return aValue - bValue;
    },
    header: () => null,

    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue("priority")
      );
      if (!priority) return null;

      return (
        <div>{priority.icon && <priority.icon className="h-4 w-4" />}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => null,

    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      );
      if (!status) return null;
      return (
        <div>
          {status.icon && <status.icon className={`h-4 w-4 ${status.color}`} />}
        </div>
      );
    },
  },

  {
    id: "title",
    accessorKey: "title",
    header: () => null,
    cell: ({ row }) => {
      return <p className="truncate">{row.getValue("title")}</p>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <div className="p-0 m-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy payment ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
