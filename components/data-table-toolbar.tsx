"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { statuses } from "@/app/data/data";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// import DataTableFacetedSort from "./data-table-faceted-sort";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2 items-center">
        {table.getColumn("status") && (
          <div>
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
          </div>
        )}
        {/* {table.getColumn("priority") && (
          <div>
            <DataTableFacetedFilter
              column={table.getColumn("priority")}
              title="Prioridade"
              options={priorities}
            />
          </div>
        )} */}

        {isFiltered && (
          <div>
            <Button
              variant="outline"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X />
            </Button>
          </div>
        )}
      </div>
      {/* <div>
        <DataTableFacetedSort
          title="Ordenar por Prioridade"
          column={table.getColumn("priority")}
        />
      </div> */}
      <div className="pt-2 max-w-sm">
        <Input
          placeholder="Pesquisar"
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
        />
      </div>
    </div>
  );
}
