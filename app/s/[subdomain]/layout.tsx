import { getCurrentAppAction } from "@/actions/appActions";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SubdomainContextProvider from "@/context/SubdomainContext";
import { Bell } from "lucide-react";
import React from "react";

export default async function AppLayout({
  params,
  children,
}: {
  params: Promise<{ subdomain: string }>;
  children: React.ReactNode;
}) {
  const { subdomain } = await params;
  const app = await getCurrentAppAction(subdomain);
  return (
    <SubdomainContextProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" subdomain={subdomain} />
        <SidebarInset>
          <header className="flex h-(--header-height) shrink-0 justify-between items-center gap-2 px-4 lg:px-6 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
              />
              {app && (
                <span className="flex flex-row gap-2">
                  <h2 className="text-base capitalize">{`${app.name}`}</h2>
                </span>
              )}
            </div>
            <div className="flex">
              <Button variant={"ghost"} size={"icon"} className="size-7">
                <Bell />
              </Button>
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </SubdomainContextProvider>
  );
}
