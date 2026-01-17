// components/sidebar/buildSidebarData.ts
export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";
export type IconKey =
  | "grip"
  | "hexagon"
  | "folder"
  | "shirt"
  | "armchair"
  | "send"
  | "userPlus";

export type NavItem = { title: string; url: string; icon?: IconKey };
export type NavGroup = { title: string; url?: string; items: NavItem[] };
export type SidebarData = {
  navSite: NavGroup;
  navPages: NavGroup;
  navSecondary: NavItem[];
  config: { name: string; url: string }[];
  invitation?: NavGroup;
};

export function buildSidebarData(
  t: (key: string) => string,
  urls: { home: string; invite: string },
  role: MemberRole
): SidebarData {
  const data: SidebarData = {
    navSite: {
      title: t("Sidebar.navSite.title"),
      url: "",
      items: [
        {
          title: t("Sidebar.navSite.items.home"),
          url: urls.home,
          icon: "grip",
        },
      ],
    },
    navPages: {
      title: t("Sidebar.navPages.title"),
      url: "",
      items: [
        { title: t("Sidebar.navPages.home"), url: "/", icon: "hexagon" },
        {
          title: t("Sidebar.navPages.projects"),
          url: "/projects",
          icon: "folder",
        },
        {
          title: t("Sidebar.navPages.essentials"),
          url: "/essentials",
          icon: "shirt",
        },
        {
          title: t("Sidebar.navPages.planned"),
          url: "/planned",
          icon: "armchair",
        },
      ],
    },
    navSecondary: [
      {
        title: t("Sidebar.navSecondary.contact"),
        url: "/contact",
        icon: "send",
      },
    ],
    config: [{ name: t("Sidebar.config.theme.title"), url: "" }],
  };

  if (role !== "MEMBER") {
    data.invitation = {
      title: t("Sidebar.invitation.title"),
      url: "",
      items: [
        {
          title: t("Sidebar.invitation.inviteUser"),
          url: urls.invite,
          icon: "userPlus",
        },
      ],
    };
  }

  return data;
}
