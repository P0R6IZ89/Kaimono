"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { statuses } from "@/data/data";

import React from "react";
import { CreateEssentialDialogTrigger } from "../dialogs/dialog-create-trigger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations("Table");
  const isFiltered = table.getState().columnFilters.length > 0;

  type FacetOption = {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  };

  const statusOptions: FacetOption[] = React.useMemo(
    () =>
      statuses.map((s) => ({
        value: s.value,
        label: t(`status.${s.value}`),
        icon: s.icon,
      })),
    [t]
  );

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {table.getColumn("status") && (
            <div>
              <DataTableFacetedFilter
                column={table.getColumn("status")}
                title={t("filter-by-status")}
                options={statusOptions}
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
                {t("clear-filters")}
                <X />
              </Button>
            </div>
          )}
        </div>
        <CreateEssentialDialogTrigger />
      </div>

      <div className="pt-2">
        <Input
          placeholder={t("search-placeholder")}
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
        />
      </div>
    </div>
  );
}
