"use client";

import { Table } from "@tanstack/react-table";
import { Plus, X } from "lucide-react";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { statuses } from "@/data/data";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import React from "react";
import { CreateEssentialDialog } from "../dialogs/dialog-create-essential";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [open, setOpen] = React.useState(false);
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-8 px-2 lg:px-3">
              <Plus />
              <span>Adicionar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar novo item</DialogTitle>
              <DialogDescription>
                Adicione novo item na lista de essenciais.
              </DialogDescription>
            </DialogHeader>
            <CreateEssentialDialog />
          </DialogContent>
        </Dialog>
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
