import { getCurrentAppAction } from "@/actions/appActions";
import { getMyInvitationsAction } from "@/actions/membershipActions";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const invitedApp = await getMyInvitationsAction();
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="relative size-7"
                  >
                    <span className="absolute top-1 right-1 inline-flex size-1 rounded-full bg-indigo-500"></span>
                    <Bell />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="end">
                  {invitedApp.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No notifications
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {invitedApp.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex flex-col border-b pb-3 last:border-b-0 last:pb-0"
                        >
                          <p className="text-sm font-bold">
                            New invite to {invite.app.name}
                          </p>
                          <p className="text-xs d">
                            You are invited to participate to {invite.app.name},
                            with the role of {invite.role}.
                          </p>
                          <p className="text-xs text-muted-foreground pt-2">
                            Check your email for details.
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </SubdomainContextProvider>
  );
}
