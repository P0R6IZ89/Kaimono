"use client";

import { useEffect, useState } from "react";
import { HomeTopBar } from "./HomeTopBar";
import type { $Enums } from "@prisma/client";
import { FilteredHomeContent } from "./FilteredHomeContent";

type projectType = {
  id: string;
  name: string;
  description?: string | null | undefined;
  image: string | null;
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

export function HomeContent({
  projects,
  allProjects,
  recentShoppingItems,
}: {
  projects: projectType;
  allProjects: allProjectType[];
  recentShoppingItems: recentShoppingItemsType;
}) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    setActiveProjectId(projects[0]?.id ?? null);
  }, [projects]);
  return (
    <div>
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
      />
    </div>
  );
}
