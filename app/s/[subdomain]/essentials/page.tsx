import React from "react";
import { DataTable } from "@/components/(essential)/table/data-table";
import { columns } from "@/components/(essential)/table/essentials-columns";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCount, getEssentialsBySubdomain } from "@/actions/actions";
import { getEssentials } from "@/actions/getEssentials";
import TotalPriceCard from "@/components/(essential)/cards/total-price-card";
import CounterCardV2 from "@/components/(essential)/cards/counter-card-v2";

interface EssentialsProps {
  params: Promise<{ subdomain: string }>;
}

export default async function Essentials({ params }: EssentialsProps) {
  const { subdomain } = await params;

  // const essencials = await getEssentials();
  // const countResponse = await getCount();
  const essentials = await getEssentialsBySubdomain(subdomain);

  // const totalPendingPrice =
  //   essencials.success && essencials.essentials
  //     ? essencials.essentials
  //         .filter((essencial) => essencial.status === "pending")
  //         .reduce((sum, essencial) => sum + essencial.price, 0)
  //     : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2">
      <div>
        <div className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h2 className="text-base">Essenciais</h2>
        </div>
        <div className="p-4 space-y-8">
          <CardHeader className="min-h-64 justify-center">
            <CardTitle>Essenciais</CardTitle>
            <CardDescription>
              <p className="text-red-500">???{JSON.stringify(essentials)}</p>
              Lista de compras de produtos essenciais.
            </CardDescription>
          </CardHeader>

          {essentials ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* <CounterCardV2 count={countResponse.data} /> */}

                {/* <TotalPriceCard totalPendingPrice={totalPendingPrice} /> */}
              </div>
              <DataTable columns={columns} data={essentials} />
            </div>
          ) : (
            <div className="text-red-500 text-center"></div>
          )}
        </div>
      </div>
      <div></div>
    </div>
  );
}
