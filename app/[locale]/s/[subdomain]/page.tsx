import React from "react";
import {
  getInitialsProjectsAndPlanned,
  getProjectWithFirstPlanned,
} from "@/actions/projectActions";
import { HomeContent } from "./components/HomeContent";
import { getRecentEssentialItems } from "@/actions/essentialsActions";

export default async function Essentials({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain } = await params;
  // const t = await getTranslations({ locale, namespace: "Dashboard" });
  const [recentShoppingItems, projects, allProject] = await Promise.all([
    getRecentEssentialItems(subdomain),
    getProjectWithFirstPlanned(subdomain),
    getInitialsProjectsAndPlanned(subdomain),
  ]);

  const Home = [
    {
      id: "1",
      name: "Home",
      image: null,
    },
  ];

  const navItems = [...Home, ...projects];

  return (
    <div className="flex flex-col mb-24 md:mb-0 p-4">
      <HomeContent
        projects={navItems}
        allProjects={allProject}
        recentShoppingItems={recentShoppingItems}
      />
    </div>
  );
}
