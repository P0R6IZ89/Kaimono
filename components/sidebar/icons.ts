"use client";
import { Coins, Folder, Grip, Hexagon, Settings, Shirt } from "lucide-react";
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
  coins: Coins,
};
