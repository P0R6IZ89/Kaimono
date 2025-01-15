"use client";

import React from "react";

import { ColumnDef } from "@tanstack/react-table";
import { statuses } from "@/app/data/data";

export const columns: ColumnDef<{
  id: string;
  title: string;
  price: string;
  status: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}>[] = [
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
          {status.icon && (
            <status.icon className={`h-4 w-4 ml-2 ${status.color}`} />
          )}
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
  // {
  //   accessorKey: "price",
  //   cell: ({ row }) => {
  //     return (
  //       <div className="hidden md:inline-block">{row.getValue("price")}</div>
  //     );
  //   },
  // },
  {
    accessorKey: "quantity",
    cell: ({ row }) => {
      return (
        <div className="mr-2">
          <span>x</span>
          {row.getValue("quantity")}
        </div>
      );
    },
  },
];
