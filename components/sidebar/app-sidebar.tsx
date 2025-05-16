import * as React from "react";

import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import NavPages from "./nav-pages";
import { NavDocuments } from "./nav-config";
import { NavSecondary } from "./nav-secondary";
import { Armchair, PackageOpen, Send, Shirt } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const data = {
  versions: ["Personal", "More comming..."],
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
  config: [
    {
      name: "Tema",
      url: "#",
    },
  ],
};

const safeUser = undefined;

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        {safeUser ? <NavUser user={safeUser} /> : ""}
      </SidebarHeader>
      <SidebarContent>
        <NavPages pages={data.navPages} />
        <NavDocuments items={data.config} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
