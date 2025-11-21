"use client";
import {
  Grip,
  Hexagon,
  Folder,
  Shirt,
  Armchair,
  Send,
  UserRoundPlus,
} from "lucide-react";
import type { IconKey } from "./buildSidebarData";

export const ICONS: Record<
  IconKey,
  React.ComponentType<{ className?: string }>
> = {
  grip: Grip,
  folder: Folder,
  hexagon: Hexagon,
  shirt: Shirt,
  armchair: Armchair,
  send: Send,
  userPlus: UserRoundPlus,
};
