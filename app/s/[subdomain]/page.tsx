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
    <div className="@container flex flex-col p-4 space-y-8 ">
      <div className="flex px-6 min-h-64 items-center lg:max-w-1/2">
        <div className="">
          <h1 className="text-xs text-muted-foreground leading-none">
            Olá, <UserName />
          </h1>
          <h2 className="pt-1 leading-none font-semibold">
            Bem vindo de volta!
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 @xl:grid-cols-2 gap-3">
        <MembersCard subdomain={subdomain} />
        <QuickEssentialCard subdomain={subdomain} />
        <QuickPlannedCard />
      </div>
    </div>
  );
}
