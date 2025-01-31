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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { DataTableToolbar } from "./data-table-toolbar";
import SwipeableCard from "./ui/swipeble";
import { ShoppingCart } from "lucide-react";
import { Progress } from "./ui/progress";

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
      <CardHeader className="min-h-64 justify-center">
        <CardTitle>Pao e leite</CardTitle>
        <CardDescription>
          Lista de compras de produtos essenciais.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card className="w-full lg:w-1/2">
          <CardHeader className="space-y-2">
            <CardTitle className="flex gap-2 items-center">
              <ShoppingCart size={16} />
              <p className="text-sm font-normal tracking-normal">
                Compras Restantes.{" "}
              </p>
            </CardTitle>
            <CardDescription className="flex gap-2 items-center">
              <p className="flex-none text-xs">10 de 20</p>
              <Progress className="h-2" value={50} />
            </CardDescription>
          </CardHeader>
        </Card>
        <DataTableToolbar table={table} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              return (
                <SwipeableCard
                  key={row.id}
                  onChange={handleChange}
                  onDelete={handleDelete}
                  onDesktopAction={handleDesktopAction}
                >
                  <div className="flex flex-cols-3  items-center p-2 pr-4">
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
              );
            })
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
