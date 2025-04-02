import CounterCard from "@/components/counter-card";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

function Planned() {
  return (
    <div className="flex flex-col">
      <div className="flex h-16 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h2 className="text-base">Planejados</h2>
      </div>
      <div className="p-4 space-y-8">
        <CardHeader className="min-h-64 justify-center">
          <CardTitle>Planejados</CardTitle>
          <CardDescription>
            Lista de compras de produtos de alto custo.
          </CardDescription>
        </CardHeader>
        {/* <CounterCard count={count} /> */}
        {/* <DataTable columns={columns} data={data} />  */}
      </div>
    </div>
  );
}

export default Planned;
