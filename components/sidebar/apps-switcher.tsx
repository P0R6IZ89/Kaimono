"use client";

import { ChevronsUpDown, Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import React from "react";
import Link from "next/link";
import { protocol, rootDomain } from "@/lib/utils";

interface appsProps {
  image: string | null;
  id: string;
  subdomain: string | null;
  name: string;
  description: string | null;
  customDomain: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface subdomainProps {
  subdomain: string | null;
  image: string | null;
  name: string;
  id: string;
  description: string | null;
  customDomain: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function AppSwitcher({
  subdomain,
  apps,
}: {
  subdomain: subdomainProps;
  apps: appsProps[];
}) {
  const { isMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={subdomain.image ?? ""}
                    alt={subdomain.name}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{subdomain.name}</span>
                <span className="truncate text-xs">{subdomain.subdomain}</span>
              </div>

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Apps
            </DropdownMenuLabel>
            {apps.map((app, index) => (
              <DropdownMenuItem asChild key={index} className="gap-2 p-2">
                <Link href={`${protocol}://${app.subdomain}.${rootDomain}`}>
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Avatar className="size-4 shrink-0">
                      <AvatarImage src={app.image ?? ""} alt={app.name} />
                      <AvatarFallback className="shrink-0">
                        {Array.from(app.name)[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {app.subdomain}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild className="gap-2 p-2">
              <Link href={`${protocol}://${rootDomain}/new-app`}>
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Adicionar novo aplicativo
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
