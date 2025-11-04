import type { ComponentType } from "react";

export type NavItem = {
  title: string;
  url: string;
  icon?: ComponentType<{ className?: string }>;
};

export type NavGroup = {
  title: string;
  url?: string;
  items: NavItem[];
};

export type SidebarData = {
  navSite: NavGroup;
  navPages: NavGroup;
  navSecondary: NavItem[];
  config: { name: string; url: string }[];
  invitation?: NavGroup; // included only for non-MEMBER roles
};

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";
