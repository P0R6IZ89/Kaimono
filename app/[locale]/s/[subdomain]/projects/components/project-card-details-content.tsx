"use client";

import {
  PlannedBacklogItem,
  ProjectWithPlanned,
} from "@/app/[locale]/types/projects";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Link } from "@/i18n/navigation";
import { formatPriceYen } from "@/util/formatPriceYen";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AssignPlannedDialog } from "./assign-planned-dialog";
import { ProjectCardUnassignButton } from "./project-card-unassign-button";

type Props = {
  project: ProjectWithPlanned;
  plannedBacklog: PlannedBacklogItem[];
  subdomain: string;
};

export function ProjectCardDetailsContent({
  project,
  plannedBacklog,
  subdomain,
}: Props) {
  const t = useTranslations("Projects");
  const tCommon = useTranslations("Common");
  const plannedStatusOrder = {
    PENDING: 0,
    PURCHASED: 1,
    CANCELLED: 2,
  } as const;

  const getPlannedHref = (title: string) => ({
    pathname: "/planned" as const,
    query: {
      title,
      showAll: "1",
    },
  });

  const sortedPlannedItems = [...project.plannedItems].sort((left, right) => {
    const statusOrderDifference =
      plannedStatusOrder[left.status] - plannedStatusOrder[right.status];

    if (statusOrderDifference !== 0) {
      return statusOrderDifference;
    }

    return (
      new Date(right.createdAt ?? 0).getTime() -
      new Date(left.createdAt ?? 0).getTime()
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1"></div>
        <AssignPlannedDialog
          projectId={project.id}
          projectName={project.name}
          plannedBacklog={plannedBacklog}
          subdomain={subdomain}
        />
      </div>

      {project.plannedItems.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          {t("project.empty")}
        </p>
      ) : (
        <div className="space-y-3">
          {sortedPlannedItems.map((item) => (
            <Item
              key={item.id}
              variant="outline"
              className="space-y-3 bg-background z-10"
            >
              <Link
                key={item.id}
                href={getPlannedHref(item.title)}
                aria-label={`${t("project.openPlanned")}: ${item.title}`}
                className="-m-2 flex min-w-0 flex-1 items-center gap-3.5 rounded-md p-2 outline-none transition-colors hover:bg-muted/70 focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <ItemMedia variant="image">
                  {item.image ? (
                    <Image
                      className="aspect-square"
                      width={50}
                      height={50}
                      src={item.image}
                      alt={item.title}
                    />
                  ) : (
                    <Avatar>
                      <AvatarFallback className="bg-muted text-muted-foreground flex items-center justify-center">
                        {item.title.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </ItemMedia>
                <ItemContent className="gap-0">
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription className="text-sm">
                    {formatPriceYen(item.price)}{" "}
                    <span className="text-muted-foreground">
                      x{item.quantity}
                    </span>
                  </ItemDescription>
                </ItemContent>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px]${item.status === "PENDING" ? " bg-amber-100 text-amber-800" : item.status === "PURCHASED" ? " bg-green-100 text-green-800" : ""}`}
                  >
                    {tCommon(`status.${item.status}`)}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${item.priority === "HIGH" || item.priority === "URGENT" ? "bg-red-100 text-red-800" : ""}`}
                  >
                    {tCommon(`priority.${item.priority}`)}
                  </Badge>
                </div>
              </Link>
              <ItemActions>
                <ProjectCardUnassignButton
                  plannedId={item.id}
                  subdomain={subdomain}
                />
              </ItemActions>
            </Item>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button asChild variant="secondary" size="sm">
          <Link href="/planned">{t("project.openPlanned")}</Link>
        </Button>
      </div>
    </div>
  );
}
