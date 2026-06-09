"use client";
import { Grip, Hexagon, Folder, Shirt, Settings } from "lucide-react";
import type { IconKey } from "./buildSidebarData";

export const ICONS: Record<
  IconKey,
  React.ComponentType<{ className?: string }>
> = {
  grip: Grip,
  folder: Folder,
  hexagon: Hexagon,
  shirt: Shirt,
  settings: Settings,
};
