"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { statuses } from "@/data/data";

import React from "react";
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
    <div className="flex flex-col gap-2 justify-start md:flex-row md:items-center mb-4">
      <div className="flex flex-1 justify-start items-center space-x-2 ">
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title={t("filter-by-status")}
            options={statusOptions}
          />
        )}

        {isFiltered && (
          <Button
            variant="outline"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t("clear-filters")}
            <X />
          </Button>
        )}
      </div>
      <Input
        className="max-w-lg md:order-first"
        placeholder={t("search-placeholder")}
        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("title")?.setFilterValue(event.target.value)
        }
      />
    </div>
  );
}
