import { getPlannedBySubdomain } from "@/actions/plannedActions";
import React from "react";
import { DataTablePlanned } from "./table/data-table";
import { columnsPlanned } from "./table/columns";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Planned({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const planned = await getPlannedBySubdomain(subdomain);
  return (
    <div className="p-4 space-y-8 max-w-xl">
      <Card className="shadow-none ">
        <CardHeader>
          <CardTitle>Planejados</CardTitle>
          <CardDescription>
            Lista de compras de produtos planejados
          </CardDescription>
        </CardHeader>
      </Card>
      {planned ? (
        <div className="space-y-8">
          <DataTablePlanned columns={columnsPlanned} data={planned} />
        </div>
      ) : (
        <div className="text-center">No results.</div>
      )}
    </div>
  );
}
