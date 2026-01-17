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
  const t = useTranslations("PlannedPage");
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
      <div className="px-4">
        <DataTableToolbar table={table} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 pt-4 gap-6">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            return (
              <div key={row.id}>
                <div className="relative">
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-24 text-center">{t("no-result")}</div>
        )}
      </div>
    </div>
  );
}
