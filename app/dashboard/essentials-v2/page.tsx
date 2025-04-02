import React from "react";
import { DataTable } from "@/components/(essential)/table/data-table";
import { columns } from "@/components/(essential)/table/essentials-columns";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CounterCard from "@/components/counter-card";
import { getCount } from "@/actions/actions";
import { getEssentials } from "@/actions/getEssentials";

export default async function Essentials() {
  const essencials = await getEssentials();
  const countResponse = await getCount();

  return (
    <div className="flex flex-col">
      <div className="flex h-16 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h2 className="text-base">Essenciais</h2>
      </div>
      <div className="p-4 space-y-8">
        <CardHeader className="min-h-64 justify-center">
          <CardTitle>Essenciais</CardTitle>
          <CardDescription>
            Lista de compras de produtos essenciais.
          </CardDescription>
        </CardHeader>

        {essencials.success && countResponse.success ? (
          <>
            <CounterCard count={countResponse.data} />
            <DataTable columns={columns} data={essencials.essentials || []} />
          </>
        ) : (
          <div className="text-red-500 text-center">
            {essencials.error ||
              countResponse.error ||
              "Unknown error occurred."}
          </div>
        )}
      </div>
    </div>
  );
}
