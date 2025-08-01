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
  Grip,
  Hexagon,
  Send,
  Shirt,
  UserRoundPlus,
} from "lucide-react";
import { AppSwitcher } from "./apps-switcher";
import { NavUser } from "./nav-user";
import { auth } from "@/auth";
import { SkeletonAvatar } from "../skeleton/avatar";
import { protocol, rootDomain } from "@/lib/utils";
import { getAllAppsAction, getCurrentAppAction } from "@/actions/appActions";

const data = {
  navSite: {
    title: "",
    url: "",
    items: [
      {
        title: "Todos os apps",
        url: `${protocol}://${rootDomain}`,
        isActive: false,
        icon: Grip,
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
        url: "/planned",
        isActive: false,
        icon: Armchair,
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

export async function AppSidebar({ subdomain, ...props }: AppSidebarProps) {
  const session = await auth();
  const apps = await getAllAppsAction();
  const currentApp = await getCurrentAppAction(subdomain);
  const data2 = {
    invitation: {
      title: "Convidar Usuário",
      url: "",
      items: [
        {
          title: "Convidar Usuário",
          url: `${protocol}://${subdomain}.${rootDomain}/invite`,
          isActive: false,
          icon: UserRoundPlus,
        },
      ],
    },
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        {apps && currentApp ? (
          <AppSwitcher apps={apps} currentApp={currentApp} />
        ) : (
          <SkeletonAvatar />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavPages pages={data.navSite} />
        <NavPages pages={data.navPages} />
        <NavPages pages={data2.invitation} />
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
