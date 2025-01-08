import React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import Link from "next/link";

const NavPages = ({
  pages,
}: {
  pages: {
    title: string;
    url: string;
    items: { title: string; url: string; isActive: boolean }[];
  };
}) => {
  return (
    <>
      <SidebarGroup key={pages.title}>
        <SidebarGroupLabel>Paginas</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {pages.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <Link href={item.url}>{item.title}</Link>
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
