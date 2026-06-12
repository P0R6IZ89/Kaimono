export type IconKey =
  | "grip"
  | "hexagon"
  | "folder"
  | "shirt"
  | "settings"
  | "coins";

export type NavItem = { title: string; url: string; icon?: IconKey };
export type NavGroup = { title: string; url?: string; items: NavItem[] };
export type SidebarData = {
  navSite: NavGroup;
  navPages: NavGroup;
  settings: NavGroup;
  config: { name: string; url: string }[];
};

type SidebarMessageKey =
  | "navSite.title"
  | "navSite.items.home"
  | "navPages.title"
  | "navPages.home"
  | "navPages.projects"
  | "navPages.essentials"
  | "config.theme.title"
  | "settings.title"
  | "settings.workspace"
  | "settings.manageCredits";

export function buildSidebarData(
  t: (key: SidebarMessageKey) => string,
  urls: { home: string; aiCredits: string },
): SidebarData {
  return {
    navSite: {
      title: t("navSite.title"),
      url: "",
      items: [
        {
          title: t("navSite.items.home"),
          url: urls.home,
          icon: "grip",
        },
      ],
    },
    navPages: {
      title: t("navPages.title"),
      url: "",
      items: [
        { title: t("navPages.home"), url: "/", icon: "hexagon" },
        {
          title: t("navPages.projects"),
          url: "/projects",
          icon: "folder",
        },
        {
          title: t("navPages.essentials"),
          url: "/essentials",
          icon: "shirt",
        },
      ],
    },
    settings: {
      title: t("settings.title"),
      items: [
        {
          title: t("settings.workspace"),
          url: "/settings",
          icon: "settings",
        },
        {
          title: t("settings.manageCredits"),
          url: urls.aiCredits,
          icon: "coins",
        },
      ],
    },
    config: [{ name: t("config.theme.title"), url: "" }],
  };
}
