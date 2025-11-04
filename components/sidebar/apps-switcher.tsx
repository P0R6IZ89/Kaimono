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
import { protocol, rootDomain } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export interface App {
  name: string;
  subdomain: string;
  image: string | null;
}
interface AppSwitcherProps {
  apps: App[];
  currentApp: App;
}

export function AppSwitcher({ apps, currentApp }: AppSwitcherProps) {
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
                    src={currentApp.image ?? ""}
                    alt={currentApp.name ?? ""}
                  />
                  <AvatarFallback className="rounded-lg">
                    {currentApp.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold capitalize">
                  {currentApp.name}
                </span>
                <span className="truncate text-xs">{`${currentApp.subdomain}.${rootDomain}`}</span>
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
            {apps.length > 1 ? (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Mudar para:
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            ) : null}

            {apps.map((app, index) => (
              <React.Fragment key={index}>
                {app.subdomain !== currentApp.subdomain ? (
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
                      <p className="capitalize">{app.subdomain}</p>
                    </Link>
                  </DropdownMenuItem>
                ) : null}
              </React.Fragment>
            ))}

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
