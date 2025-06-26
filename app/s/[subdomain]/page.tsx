import UserName from "@/components/client/username";
import React from "react";
import MembersCard from "./components/MembersCard";
import QuickEssentialCard from "./components/QuickEssential";
import QuickPlannedCard from "./components/QuickPlanned";

export default async function Essentials({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  return (
    <div className="flex flex-col p-4 space-y-8">
      <div className="flex px-6 min-h-64 items-center max-w-1/2">
        <div className="">
          <h1 className="text-sm text-muted-foreground leading-none font-semibold">
            <UserName />
          </h1>
          <h2 className="pt-1 leading-none font-semibold">Bem Vindo</h2>
          <p className="text-muted-foreground text-sm pt-2">
            Lista de compras de produtos essenciais.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MembersCard subdomain={subdomain} />
        <QuickEssentialCard />
        <QuickPlannedCard />
      </div>
    </div>
  );
}
