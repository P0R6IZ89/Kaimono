import React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface pagesProps {
  pages: {
    title: string;
    url: string;
    items: {
      title: string;
      url: string;
      isActive?: boolean;
      icon?: LucideIcon;
    }[];
  };
}

const NavPages = ({ pages }: pagesProps) => {
  return (
    <>
      <SidebarGroup key={pages.title}>
        <SidebarGroupLabel>Paginas</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {pages.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <span>
                    {item.icon && <item.icon />}
                    <Link href={pages.url + item.url}>{item.title}</Link>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

export default NavPages;
