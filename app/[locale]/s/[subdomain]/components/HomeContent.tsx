"use client";

import { useEffect, useState } from "react";
import { HomeTopBar } from "./HomeTopBar";
import type { $Enums } from "@prisma/client";
import { FilteredHomeContent } from "./FilteredHomeContent";

type projectType = {
  id: string;
  name?: string | null | undefined;
  description?: string | null | undefined;
  image?: string | null;
  icon?: string | null;
  type?: string | undefined;
}[];

export type allProjectType = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  plannedItems: {
    id: string;
    title: string;
    productUrl?: string | null;
    status: $Enums.Status;
    priority: $Enums.Priority;
    price: number;
    quantity: number;
    createdAt: Date;
    image: string;
  }[];
  counts: {
    total: number;
    pending: number;
    purchased: number;
    cancelled: number;
  };
};

export type recentShoppingItemsType = {
  id: string;
  status: $Enums.Status;
  title: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}[];

export type oldestPlannedItemsType = {
  id: string;
  title: string;
  productUrl?: string | null | undefined;
  createdAt: Date;
  image: string;
}[];

export type recentlyAddedType = {
  id: string;
  title: string;
  productUrl?: string | null | undefined;
  createdAt: Date;
  image: string;
}[];

export function HomeContent({
  projects,
  allProjects,
  recentShoppingItems,
  oldestPlannedItems,
  recentlyAdded,
}: {
  projects: projectType;
  allProjects: allProjectType[];
  recentShoppingItems: recentShoppingItemsType;
  oldestPlannedItems: oldestPlannedItemsType;
  recentlyAdded: recentlyAddedType;
}) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    setActiveProjectId(projects[0]?.id ?? null);
  }, [projects]);
  return (
    <div className="min-w-0">
      <HomeTopBar
        projects={projects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
      />
      <div className="my-6" />
      <FilteredHomeContent
        activeProjectId={activeProjectId}
        allProjects={allProjects}
        recentShoppingItems={recentShoppingItems}
        oldestPlannedItems={oldestPlannedItems}
        recentlyAdded={recentlyAdded}
      />
    </div>
  );
}
