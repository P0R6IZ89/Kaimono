import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import React from "react";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
      <Toaster />
    </main>
  );
}
