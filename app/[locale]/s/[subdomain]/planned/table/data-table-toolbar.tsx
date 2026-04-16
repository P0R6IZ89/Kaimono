"use client";

import { Table } from "@tanstack/react-table";
import { CircleCheckBig, CircleMinus, Clock, X } from "lucide-react";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { useTranslations } from "next-intl";
import { CreatePlannedDialogTrigger } from "../dialogs/dialog-create-trigger";

const statuses = [
  {
    value: "PENDING",
    icon: Clock,
  },

  {
    value: "PURCHASED",
    icon: CircleCheckBig,
  },
  {
    value: "CANCELLED",
    icon: CircleMinus,
  },
];

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations("Table");
  const tCommon = useTranslations("Common");
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
        label: tCommon(`status.${s.value}`),
        icon: s.icon,
      })),
    [tCommon],
  );

  return (
    <div className="flex flex-col gap-2 max-w-xl">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {table.getColumn("status") && (
            <div>
              <DataTableFacetedFilter
                column={table.getColumn("status")}
                title={t("filterByStatus")}
                options={statusOptions}
              />
            </div>
          )}

          {isFiltered && (
            <div className="flex">
              <Button
                variant={"secondary"}
                onClick={() => table.resetColumnFilters()}
                className="h-8 px-2 lg:px-3"
              >
                {t("clearFilters")}
                <X />
              </Button>
            </div>
          )}
        </div>
        <CreatePlannedDialogTrigger
          className="shrink-0"
          buttonVariant="outline"
        />
      </div>
      <div>
        <Input
          className=""
          placeholder={t("searchPlaceholder")}
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
        />
      </div>
    </div>
  );
}
