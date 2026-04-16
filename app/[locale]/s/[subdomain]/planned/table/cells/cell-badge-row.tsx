"use client";

import React from "react";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CircleCheckBig,
  CircleMinus,
  Clock,
  Folder,
  LucideIcon,
  TriangleAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import LinkDropdownCell from "./link-dropdown";

const statuses = [
  {
    value: "PENDING",
    icon: Clock,
  },

  {
    value: "PURCHASED",
    icon: CircleCheckBig,
  },
  {
    value: "CANCELLED",
    icon: CircleMinus,
  },
];

const priorities = [
  {
    value: "LOW",
    icon: ArrowDown,
  },
  {
    value: "MEDIUM",
    icon: ArrowRight,
  },
  {
    value: "HIGH",
    icon: ArrowUp,
  },
  {
    value: "URGENT",
    icon: TriangleAlert,
  },
];

function BadgeRowCell({ row }: { row: Row<PlannedSchema> }) {
  const { status, priority, project, productUrl } = row.original;
  const tCommon = useTranslations("Common");

  const tPriorities = React.useMemo(
    () =>
      priorities.map((p) => ({
        value: p.value,
        label: tCommon(`priority.${p.value}`),
        icon: p.icon,
      })),
    [tCommon],
  );
  const match = tPriorities.find((p) => p.value === priority);
  const Icon = match?.icon as LucideIcon | undefined;

  const tStatuses = React.useMemo(() => {
    return statuses.map((s) => ({
      value: s.value,
      label: tCommon(`status.${s.value}`),
      icon: s.icon,
    }));
  }, [tCommon]);
  const statusMatch = tStatuses.find((s) => s.value === status);
  const StatusIcon = statusMatch?.icon as LucideIcon | undefined;

  // const handleLike = async () => {
  //   try {
  //     await toggleLikeAction(id);
  //   } catch {}
  // };

  return (
    <div className="flex flex-row gap-2 justify-between items-center h-full px-4 pt-4 pb-2 text-foreground">
      <div className="flex flex-row gap-2">
        <Badge variant={`${status === "PURCHASED" ? "secondary" : "outline"}`}>
          {StatusIcon ? <StatusIcon className="mr-1 h-4 w-4" /> : null}
          {statusMatch?.label ?? status}
        </Badge>
        <Badge
          variant={`${priority === "URGENT" || priority === "HIGH" ? "destructive" : "outline"}`}
        >
          {Icon ? <Icon className="mr-1 h-4 w-4" /> : null}
          {match?.label ?? priority}
        </Badge>
      </div>
      <div className="flex flex-row gap-2">
        <LinkDropdownCell productUrl={productUrl} />
        {project?.name && (
          <Badge
            variant={"secondary"}
            className="flex flex-row items-center gap-1"
          >
            <Folder />
            {project.name}
          </Badge>
        )}
      </div>
    </div>
    // <div className="dark relative flex justify-end">
    //   <div className="absolute bottom-4 right-4 flex flex-col gap-2 justify-end z-10 text-foreground">
    //     <Button onClick={handleLike} variant={"ghost"}>
    //       {likedByMe ? <Heart className=" fill-red-500 stroke-0" /> : <Heart />}
    //     </Button>
    //     <Button variant={"ghost"}>
    //       {status === "PURCHASED" ? <Check className="text-green-500" /> : null}
    //       {status === "CANCELLED" ? <Ban className="text-destructive" /> : null}
    //       {status === "PENDING" ? (
    //         <Clock className="text-foreground/70" />
    //       ) : null}
    //     </Button>
    //   </div>
    // </div>
  );
}

export default BadgeRowCell;
