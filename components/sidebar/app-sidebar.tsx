"use client";

import * as React from "react";

import NavPages from "./nav-pages";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavSecondary } from "./nav-secondary";
import { Armchair, PackageOpen, Send, Shirt } from "lucide-react";
import { VersionSwitcher } from "./version-switcher";
import { ModeToggle } from "../theme-toggle";

const data = {
  user: {
    name: "Alam Sawame",
    email: "alamsawame@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  versions: ["Family", "Personal", "Organization"],
  navPages: {
    title: "Paginas",
    url: "/dashboard",
    items: [
      {
        title: "Essenciais",
        url: "/essentials-v2",
        isActive: false,
        icon: Shirt,
      },
      {
        title: "Planejados",
        url: "/planned",
        isActive: false,
        icon: Armchair,
      },
      {
        title: "Descartar",
        url: "/discart",
        isActive: false,
        icon: PackageOpen,
      },
    ],
  },
  navSecondary: [
    {
      title: "Contato",
      url: "#",
      icon: Send,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavPages pages={data.navPages} />
        <ModeToggle />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
