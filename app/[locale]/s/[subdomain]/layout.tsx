import { getCurrentAppAction, requireSession } from "@/actions/appActions";
import { getMyInvitationsAction } from "@/actions/membershipActions";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
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
import { Bell, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import React from "react";

export default async function AppLayout({
  params,
  children,
}: {
  params: Promise<{ subdomain: string }>;
  children: React.ReactNode;
}) {
  const { subdomain } = await params;
  await requireSession();
  const app = await getCurrentAppAction(subdomain);
  const invitedApp = await getMyInvitationsAction();
  const t = await getTranslations("team-layout");
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
              <Separator orientation="vertical" />
              <h1 className="ml-2 text-base ">{app.name}</h1>
            </div>
            <div className="flex">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="relative size-7"
                  >
                    {invitedApp.length !== 0 ? (
                      <span className="absolute top-1 right-1 inline-flex size-1 rounded-full dark:bg-sky-300 bg-sky-400" />
                    ) : null}
                    <Bell />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="end">
                  {invitedApp.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("no-invites")}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {invitedApp.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex flex-col border-b pb-2 last:border-b-0 last:pb-0"
                        >
                          <p className="text-sm font-bold flex items-center gap-2">
                            <Mail className="size-4" />
                            <span>
                              {t("new-invite-to-invite-team-name", {
                                teamName: invite.app.name,
                              })}
                            </span>
                          </p>
                          <p className="text-xs pt-1">
                            {t("new-invite-content", {
                              teamName: invite.app.name,
                              inviteRole: invite.role,
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground pt-2">
                            {t("check-email-for-details")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </header>
          <MobileBottomNav />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </SubdomainContextProvider>
  );
}
