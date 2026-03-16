"use client";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { DataTableToolbar } from "./data-table-toolbar";
import { useTranslations } from "next-intl";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTablePlanned<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations("Planned");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: "status", value: ["PENDING"] },
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      rowSelection,
    },
    initialState: {
      sorting: [
        {
          id: "createdAt",
          desc: true,
        },
      ],
    },
  });
  return (
    <div>
      <div className="px-4 pb-4">
        <DataTableToolbar table={table} />
      </div>
      <div className="grid grid-cols-1 p-0 md:px-4 md:grid-cols-3 xl:grid-cols-3 gap-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            return (
              <div key={row.id}>
                <div className="relative bg-muted/60 rounded-xl pb-4">
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-24 text-center">{t("empty.search")}</div>
        )}
      </div>
    </div>
  );
}
