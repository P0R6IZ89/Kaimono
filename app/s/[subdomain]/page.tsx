import UserName from "@/components/client/username";
import React from "react";
import MembersCard from "./components/MembersCard";
import QuickEssentialCard from "./components/QuickEssential";
import QuickPlannedCard from "./components/QuickPlanned";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InviteToastHandler from "./components/InviteToastHandler";

export default async function Essentials({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  return (
    <div className="@container max-w-5xl flex flex-col p-4 space-y-4 ">
      <InviteToastHandler />
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardDescription>
            Olá, <UserName />
          </CardDescription>
          <CardTitle className="font-normal">Bem vindo de volta! 😊</CardTitle>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <MembersCard subdomain={subdomain} />
        <QuickEssentialCard subdomain={subdomain} />
        <QuickPlannedCard subdomain={subdomain} />
      </div>
    </div>
  );
}
