import React from "react";
import { DataTable } from "@/components/(essential)/table/data-table";
import { columns } from "@/components/(essential)/table/essentials-columns";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEssentialsBySubdomain } from "@/actions/essentialsActions";

interface EssentialsProps {
  params: Promise<{ subdomain: string }>;
}

export default async function Essentials({ params }: EssentialsProps) {
  const { subdomain } = await params;
  const essentials = await getEssentialsBySubdomain(subdomain);

  return (
    <div className="p-4 space-y-8 max-w-1/2">
      <CardHeader className="min-h-64 justify-center">
        <CardTitle>Essenciais</CardTitle>
        <CardDescription>
          Lista de compras de produtos essenciais.
        </CardDescription>
      </CardHeader>

      {essentials ? (
        <div className="space-y-8">
          <DataTable columns={columns} data={essentials} />
        </div>
      ) : (
        <div className="text-center">No results.</div>
      )}
    </div>
  );
}
