import { getAppFromSubdomainAction } from "@/actions/actions";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import SubdomainContextProvider from "@/context/SubdomainContext";
import { ChevronRight } from "lucide-react";
import React from "react";

export default async function AppLayout({
  params,
  children,
}: {
  params: Promise<{ subdomain: string }>;
  children: React.ReactNode;
}) {
  const { subdomain } = await params;
  const app = await getAppFromSubdomainAction(subdomain);
  return (
    <SubdomainContextProvider>
      <SidebarProvider>
        <AppSidebar subdomain={subdomain} />
        <SidebarInset>
          <div className="flex h-16 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-muted-foreground"
            />
            {app && (
              <span className="flex flex-row gap-2">
                <h2 className="text-base">{`${app.name}`}</h2>
                <ChevronRight />
              </span>
            )}
          </div>
          {children}
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </SubdomainContextProvider>
  );
}
