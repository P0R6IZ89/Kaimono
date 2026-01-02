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
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "../../../../../../components/ui/button";
import { DataTableToolbar } from "./data-table-toolbar";
import { useTranslations } from "next-intl";
import { Item, ItemContent, ItemSeparator } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const tTable = useTranslations("Table");
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
    <Item variant={"muted"}>
      <ItemContent>
        <DataTableToolbar table={table} />
        <Separator />
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, index) => {
            return (
              <React.Fragment key={row.id}>
                <div className="flex flex-cols-4 space-x-3 items-center ">
                  {row.getVisibleCells().map((cell) => (
                    <React.Fragment key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </React.Fragment>
                  ))}
                </div>
                {index !== row.index - 1 && <ItemSeparator />}
              </React.Fragment>
            );
          })
        ) : (
          <div className="h-24 text-center">{tTable("no-result")}</div>
        )}
        <div className="flex items-center justify-end space-x-2 py-4 max-w-xl">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {tTable("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {tTable("next")}
          </Button>
        </div>
      </ItemContent>
    </Item>
  );
}
