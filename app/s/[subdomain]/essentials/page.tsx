import React from "react";
import { DataTable } from "@/app/s/[subdomain]/essentials/table/data-table";
import { columns } from "@/app/s/[subdomain]/essentials/table/essentials-columns";
import { getEssentialsBySubdomain } from "@/actions/essentialsActions";

interface EssentialsProps {
  params: Promise<{ subdomain: string }>;
}

export default async function Essentials({ params }: EssentialsProps) {
  const { subdomain } = await params;
  const essentials = await getEssentialsBySubdomain(subdomain);

  return (
    <div className="p-4 space-y-8 max-w-1/2">
      <div className="flex px-6 min-h-64 items-center">
        <div className="">
          <h1 className="leading-none font-semibold">Essenciais</h1>
          <p className="text-muted-foreground text-sm pt-2">
            Lista de compras de produtos essenciais.
          </p>
        </div>
      </div>

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
