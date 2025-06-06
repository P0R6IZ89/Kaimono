import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import SubdomainContextProvider from "@/context/SubdomainContext";
import React from "react";

export default async function AppLayout({
  params,
  children,
}: {
  params: Promise<{ subdomain: string }>;
  children: React.ReactNode;
}) {
  const { subdomain } = await params;
  return (
    <SubdomainContextProvider>
      <SidebarProvider>
        <AppSidebar subdomain={subdomain} />

        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
      <Toaster />
    </SubdomainContextProvider>
  );
}
