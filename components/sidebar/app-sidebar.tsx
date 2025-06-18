import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import NavPages from "./nav-pages";
import { NavConfig } from "./nav-config";
import { NavSecondary } from "./nav-secondary";
import {
  Armchair,
  Hexagon,
  PackageOpen,
  Send,
  Shirt,
  Squircle,
} from "lucide-react";
import { AppSwitcher } from "./apps-switcher";
import { getAllAppsAction, getAppFromSubdomainAction } from "@/actions/actions";
import { NavUser } from "./nav-user";
import { auth } from "@/auth";
import { SkeletonAvatar } from "../skeleton/avatar";
import { protocol, rootDomain } from "@/lib/utils";

const data = {
  navSite: {
    title: "",
    url: "",
    items: [
      {
        title: "Todos os apps",
        url: `${protocol}://${rootDomain}`,
        isActive: false,
        icon: Squircle,
      },
    ],
  },
  navPages: {
    title: "Paginas",
    url: "",
    items: [
      {
        title: "Início",
        url: "/",
        isActive: false,
        icon: Hexagon,
      },
      {
        title: "Essenciais",
        url: "/essentials",
        isActive: false,
        icon: Shirt,
      },
      {
        title: "Planejados",
        url: "#",
        isActive: false,
        icon: Armchair,
      },
      {
        title: "Descartar",
        url: "#",
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

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  subdomain: string;
};

export async function AppSidebar({
  subdomain,
  ...props
}: AppSidebarProps): Promise<JSX.Element> {
  const session = await auth();
  const subdomainDetails = await getAppFromSubdomainAction(subdomain);
  const allApps = await getAllAppsAction();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        {subdomainDetails ? (
          <AppSwitcher subdomain={subdomainDetails} apps={allApps} />
        ) : (
          <SkeletonAvatar />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavPages pages={data.navSite} />
        <NavPages pages={data.navPages} />
        <NavConfig items={data.config} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {session?.user ? (
          <NavUser
            user={{
              name: session?.user?.name ?? "",
              email: session?.user?.email ?? "",
              image: session?.user?.image ?? "",
            }}
          />
        ) : (
          <SkeletonAvatar />
        )}
      </SidebarFooter>
      <div className="pb-10" />
    </Sidebar>
  );
}
