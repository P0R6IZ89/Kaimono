import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import NavPages from "./nav-pages";
import { NavConfig } from "./nav-config";
import { NavSecondary } from "./nav-secondary";
import { Armchair, PackageOpen, Send, Shirt } from "lucide-react";
import { AppSwitcher } from "./apps-switcher";
import { getAppsAction } from "@/actions/actions";

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

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // const apps = await getAppsAction();
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        {/* <AppSwitcher apps={apps} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavPages pages={data.navPages} />
        <NavConfig items={data.config} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
