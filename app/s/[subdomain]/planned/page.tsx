import { getPlannedBySubdomain } from "@/actions/plannedActions";
import React from "react";
import { DataTablePlanned } from "./table/data-table";
import { columnsPlanned } from "./table/columns";

export default async function Planned({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const planned = await getPlannedBySubdomain(subdomain);
  return (
    <div className="px-1 py-9 space-y-8 max-w-xl">
      <div className="flex min-h-32 items-center">
        <div className="">
          <h1 className="leading-none font-semibold">Planejados</h1>
          <p className="text-muted-foreground text-sm pt-2">
            Lista de compras de produtos de alto custo.
          </p>
        </div>
      </div>

      <DataTablePlanned columns={columnsPlanned} data={planned} />
      <div className="text-center">No results.</div>
    </div>
  );
}
