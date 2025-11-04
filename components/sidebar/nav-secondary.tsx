"use client";

import * as React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import { ICONS } from "./icons";
import type { NavItem } from "./buildSidebarData";

type Props = {
  items: NavItem[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>;

export function NavSecondary({ items, ...props }: Props) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon ? ICONS[item.icon] : null;
            const isExternal = /^https?:\/\//.test(item.url);

            const Inner = (
              <>
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{item.title}</span>
              </>
            );

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild size="sm">
                  {isExternal ? (
                    <a href={item.url} rel="noopener noreferrer">
                      {Inner}
                    </a>
                  ) : (
                    <Link href={item.url}>{Inner}</Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default NavSecondary;
