import React from "react";
import {
  getInitialsProjectsAndPlanned,
  getProjectWithFirstPlanned,
} from "@/actions/projectActions";
import { HomeContent } from "./components/HomeContent";
import { getRecentEssentialItems } from "@/actions/essentialsActions";
import {
  getOldestPlannedItems,
  getRecentlyAdded,
} from "@/actions/plannedActions";

export default async function Essentials({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain } = await params;
  const [
    recentShoppingItems,
    projects,
    allProject,
    oldestPlannedItems,
    recentlyAdded,
  ] = await Promise.all([
    getRecentEssentialItems(subdomain),
    getProjectWithFirstPlanned(subdomain),
    getInitialsProjectsAndPlanned(subdomain),
    getOldestPlannedItems(subdomain),
    getRecentlyAdded(subdomain),
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
    <div className="flex min-w-0 max-w-full flex-col overflow-x-hidden p-4 mb-24 md:mb-0">
      <HomeContent
        projects={navItems}
        allProjects={allProject}
        recentShoppingItems={recentShoppingItems}
        oldestPlannedItems={oldestPlannedItems}
        recentlyAdded={recentlyAdded}
      />
    </div>
  );
}
