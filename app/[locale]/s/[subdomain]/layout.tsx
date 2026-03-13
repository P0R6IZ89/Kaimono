import { getCurrentAppAction, requireSession } from "@/actions/appActions";
import { getMyInvitationsAction } from "@/actions/membershipActions";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SubdomainContextProvider from "@/context/SubdomainContext";
import { getTranslations } from "next-intl/server";
import React from "react";
import { Notification } from "./components/notification";
import { SettingIcon } from "./components/settingIcon";

export default async function AppLayout({
  params,
  children,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
  children: React.ReactNode;
}) {
  const { subdomain, locale } = await params;
  await requireSession();
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
        <AppSidebar variant="inset" subdomain={subdomain} locale={locale} />
        <SidebarInset>
          <header className="flex h-(--header-height) shrink-0 justify-between items-center gap-2 px-4 lg:px-6 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" />
              <h1 className="ml-2 text-base ">{app.name}</h1>
            </div>
            <Notification />
            <SettingIcon />
          </header>
          <MobileBottomNav />
          <div className="pb-[calc(env(safe-area-inset-bottom)+96px)] md:pb-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SubdomainContextProvider>
  );
}
