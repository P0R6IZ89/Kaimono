"use client";

import { Table } from "@tanstack/react-table";
import { Plus, X } from "lucide-react";
import { statuses } from "@/data/data";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";

import React from "react";
import { DataTableFacetedFilter } from "../../essentials/table/data-table-faceted-filter";
import { CreatePlannedDialogTrigger } from "../dialogs/dialog-create-trigger";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {table.getColumn("status") && (
            <div>
              <DataTableFacetedFilter
                column={table.getColumn("status")}
                title="Status"
                options={statuses}
              />
            </div>
          )}

          {isFiltered && (
            <div className="flex">
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
        <CreatePlannedDialogTrigger>
          <Button className="h-8 px-2 lg:px-3">
            <Plus />
            <span>Adicionar</span>
          </Button>
        </CreatePlannedDialogTrigger>
      </div>

      <div className="pt-2">
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
