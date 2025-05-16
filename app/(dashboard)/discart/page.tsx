import CounterCard from "@/components/(essential)/cards/counter-card";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

function Discart() {
  const count = { fullCount: 30, pendingCount: 5 };
  return (
    <div className="flex flex-col">
      <div className="flex h-16 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h2 className="text-base">Discartar</h2>
      </div>
      <div className="p-4 space-y-8">
        <CardHeader className="min-h-64 justify-center">
          <CardTitle>Discartar</CardTitle>
          <CardDescription>
            Lista de items para serem discardados.
          </CardDescription>
        </CardHeader>
        <CounterCard count={count} />
        <div className="flex flex-row gap-2">
          <p>Foto</p>
          <p>Nome do item</p>
          <p>Motivo para descartar</p>
          <p>created by</p>
          <p>created at</p>
        </div>
      </div>
    </div>
  );
}

export default Discart;
