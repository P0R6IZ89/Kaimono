import React from "react";
import { Button } from "./ui/button";
import { Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

interface DataTableFacetedSortProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
}

function DataTableFacetedSort<TData, TValue>({
  column,
  title,
}: DataTableFacetedSortProps<TData, TValue>) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8"
      onClick={() => column?.toggleSorting()}
    >
      <ArrowUpDown />
      {title}
    </Button>
  );
}

export default DataTableFacetedSort;
