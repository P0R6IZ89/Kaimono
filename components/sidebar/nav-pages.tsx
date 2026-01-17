"use client";

import React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { Link } from "@/i18n/navigation";
import { ICONS } from "./icons";
import type { NavGroup } from "./buildSidebarData";

type Props = { pages: NavGroup };

export default function NavPages({ pages }: Props) {
  return (
    <SidebarGroup key={pages.title}>
      <SidebarGroupLabel>{pages.title}</SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {pages.items.map((item) => {
            const isExternal = /^https?:\/\//.test(item.url);
            const Icon = item.icon ? ICONS[item.icon] : null;
            const Inner = (
              <>
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {item.title}
              </>
            );

            return (
              <SidebarMenuItem key={`${pages.title}-${item.title}`}>
                <SidebarMenuButton asChild>
                  {isExternal ? (
                    <Link href={item.url} rel="noopener noreferrer">
                      {Inner}
                    </Link>
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
