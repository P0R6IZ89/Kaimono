"use client";

import React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { DataTableToolbar } from "./data-table-toolbar";
import SwipeableCard from "./ui/swipeble";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: "status", value: "pending" },
  ]);

  const handleChange = () => console.log("Change triggered");
  const handleDelete = () => console.log("Delete triggered");
  const handleDesktopAction = () => console.log("Desktop action triggered");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="flex-row">
      <div className="flex h-16 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h2 className="text-base">Pao e leite</h2>
      </div>
      <CardHeader>
        <CardTitle>Pao e leite</CardTitle>
        <CardDescription>dnsjfhdhdssdz</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataTableToolbar table={table} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <SwipeableCard
                key={row.id}
                onChange={handleChange}
                onDelete={handleDelete}
                onDesktopAction={handleDesktopAction}
              >
                <div className="flex gap-2 items-center pr-4">
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className={`${
                        cell.column.columnDef.id === "title"
                          ? "flex-1 truncate"
                          : "w-auto"
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  ))}
                </div>
              </SwipeableCard>
            ))
          ) : (
            <div className="h-24 text-center">No results.</div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Proximo
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
