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
import { AppSwitcher } from "./apps-switcher";
import { NavUser } from "./nav-user";
import { SkeletonAvatar } from "../skeleton/avatar";
import { protocol, rootDomain } from "@/lib/utils";
import {
  getAllAppsAction,
  getCurrentAppAction,
  getMembership,
  requireSession,
} from "@/actions/appActions";
import { getTranslations } from "next-intl/server";
import { buildSidebarData, MemberRole } from "./buildSidebarData";
import { Alert, AlertDescription } from "../ui/alert";
import { Check } from "lucide-react";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  subdomain: string;
};

export async function AppSidebar({ subdomain, ...props }: AppSidebarProps) {
  const session = await requireSession();
  const [apps, currentApp, memberRole] = await Promise.all([
    getAllAppsAction(),
    getCurrentAppAction(subdomain),
    getMembership(subdomain),
  ]);

  const t = await getTranslations();

  const urls = {
    home: `${protocol}://${rootDomain}`,
    invite: `/invite`,
  };

  const data = buildSidebarData(
    t,
    urls,
    (memberRole as MemberRole) ?? "MEMBER"
  );

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
        {data.invitation && <NavPages pages={data.invitation} />}

        <NavConfig items={data.config} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        <Alert>
          <Check color="#00f900" />
          <AlertDescription className="text-xs">
            {t("UpdateApp.description")}
          </AlertDescription>
        </Alert>
      </SidebarContent>
      <SidebarFooter>
        {session.user ? (
          <NavUser
            memberRole={memberRole ?? undefined}
            user={{
              name: session.user.name ?? "",
              email: session.user.email ?? "",
              image: session.user.image ?? "",
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
