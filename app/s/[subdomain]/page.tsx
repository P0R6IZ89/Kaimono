import { auth } from "@/auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

export default async function Essentials({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const session = await auth();
  return (
    <div>
      <SidebarTrigger className="-ml-1" />

      <div className="grid grid-cols-1 xl:grid-cols-2">
        {subdomain}
        <p className="z-50">{session?.user?.email}</p>
      </div>
    </div>
  );
}
