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

type SidebarMessageKey =
  | "navSite.title"
  | "navSite.items.home"
  | "navPages.title"
  | "navPages.home"
  | "navPages.projects"
  | "navPages.essentials"
  | "navPages.planned"
  | "navSecondary.contact"
  | "config.theme.title"
  | "invitation.title"
  | "invitation.inviteUser";

export function buildSidebarData(
  t: (key: SidebarMessageKey) => string,
  urls: { home: string; invite: string },
  role: MemberRole
): SidebarData {
  const data: SidebarData = {
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
        {
          title: t("navPages.planned"),
          url: "/planned",
          icon: "armchair",
        },
      ],
    },
    navSecondary: [
      {
        title: t("navSecondary.contact"),
        url: "/contact",
        icon: "send",
      },
    ],
    config: [{ name: t("config.theme.title"), url: "" }],
  };

  if (role !== "MEMBER") {
    data.invitation = {
      title: t("invitation.title"),
      url: "",
      items: [
        {
          title: t("invitation.inviteUser"),
          url: urls.invite,
          icon: "userPlus",
        },
      ],
    };
  }

  return data;
}
