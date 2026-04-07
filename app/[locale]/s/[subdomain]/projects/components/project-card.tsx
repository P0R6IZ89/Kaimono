"use client";

import {
  PlannedBacklogItem,
  ProjectWithPlanned,
} from "@/app/[locale]/types/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPriceYen } from "@/util/formatPriceYen";
import { ChevronDown, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps, type ReactNode, useState } from "react";
import { ProjectCardAddContent } from "./project-card-add-content";
import { ProjectCardDetailsContent } from "./project-card-details-content";
import { ProjectCardPanel } from "./project-card-panel";
import { ProjectEditDialog } from "./project-edit-dialog";

type Props = {
  project: ProjectWithPlanned;
  plannedBacklog: PlannedBacklogItem[];
  subdomain: string;
};

type BadgeVariant = ComponentProps<typeof Badge>["variant"];
type ProjectTranslations = ReturnType<typeof useTranslations>;
type ProjectStatusBadge = {
  key: string;
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

function getProjectAmounts(plannedItems: PlannedBacklogItem[]) {
  return plannedItems.reduce(
    (amounts, item) => {
      const itemTotal = (item.price ?? 0) * (item.quantity ?? 1);

      amounts.totalPlannedAmount += itemTotal;

      if (item.status === "PENDING") {
        amounts.totalPendingAmount += itemTotal;
      }

      return amounts;
    },
    {
      totalPlannedAmount: 0,
      totalPendingAmount: 0,
    },
  );
}

function getProjectStatusBadges(
  project: ProjectWithPlanned,
  t: ProjectTranslations,
): ProjectStatusBadge[] {
  const badges: ProjectStatusBadge[] = [
    {
      key: "total",
      label: t("project.badges.total", { count: project.counts.total }),
      variant: "secondary",
    },
    {
      key: "pending",
      label: t("project.badges.pending", { count: project.counts.pending }),
      className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    },
    {
      key: "purchased",
      label: t("project.badges.purchased", {
        count: project.counts.purchased,
      }),
      className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
    },
    {
      key: "cancelled",
      label: t("project.badges.cancelled", {
        count: project.counts.cancelled,
      }),
      className: "bg-rose-100 text-rose-800 hover:bg-rose-100",
    },
  ];

  return badges.filter((badge) => {
    if (badge.key === "total") return true;
    return project.counts[badge.key as keyof typeof project.counts] > 0;
  });
}

function ProjectCardBackdrop({
  show,
  onClick,
}: {
  show: boolean;
  onClick: () => void;
}) {
  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-40 bg-black/50"
      onClick={onClick}
    />
  );
}

function ProjectCardHeader({
  project,
  statusBadges,
  actions,
}: {
  project: ProjectWithPlanned;
  statusBadges: ProjectStatusBadge[];
  actions: ReactNode;
}) {
  return (
    <CardHeader className="flex flex-col gap-3">
      <div className="flex w-full justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tighter capitalize">
          {project.name}
        </CardTitle>
        <div className="flex justify-center gap-1">{actions}</div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {statusBadges.map((badge) => (
            <Badge
              key={badge.key}
              variant={badge.variant}
              className={badge.className}
            >
              {badge.label}
            </Badge>
          ))}
        </div>

        {project.description ? (
          <CardDescription>{project.description}</CardDescription>
        ) : null}
      </div>
    </CardHeader>
  );
}

function ProjectCardSummary({
  totalPendingAmount,
  totalPlannedAmount,
  detailsTrigger,
  t,
}: {
  totalPendingAmount: number;
  totalPlannedAmount: number;
  detailsTrigger: ReactNode;
  t: ProjectTranslations;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-row justify-between items-baseline">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold">
            {formatPriceYen(totalPendingAmount)}
          </span>
          <span className="text-xs text-muted-foreground">
            {t("project.totalPendingValue")}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-muted-foreground">
            {formatPriceYen(totalPlannedAmount)}
          </span>
          <span className="text-xs text-muted-foreground">
            {t("project.totalValue")}
          </span>
        </div>
      </div>

      {detailsTrigger}
    </div>
  );
}

export function ProjectCard({ project, plannedBacklog, subdomain }: Props) {
  const t = useTranslations("Projects");

  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isUploadWidgetOpen, setIsUploadWidgetOpen] = useState(false);

  const { totalPendingAmount, totalPlannedAmount } = getProjectAmounts(
    project.plannedItems,
  );
  const statusBadges = getProjectStatusBadges(project, t);

  const addItemTrigger = (
    <Button variant="default" size="sm">
      <Plus className="h-4 w-4" />
    </Button>
  );

  const detailsTrigger = (
    <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
      <ChevronDown />
    </Button>
  );

  return (
    <>
      <ProjectCardBackdrop
        show={isAddPanelOpen || isDetailsPanelOpen}
        onClick={() => {
          if (!isUploadWidgetOpen) setIsAddPanelOpen(false);
        }}
      />
      <Card className="shadow-md pb-2">
        <ProjectCardHeader
          project={project}
          statusBadges={statusBadges}
          actions={
            <>
              <ProjectEditDialog project={project} />
              <ProjectCardPanel
                open={isAddPanelOpen}
                onOpenChange={setIsAddPanelOpen}
                trigger={addItemTrigger}
                title={t("add.title", { projectName: project.name })}
                description={t("add.description")}
                contentClassName="sm:max-w-2xl max-h-[80vh] overflow-y-auto"
                preventClose={isUploadWidgetOpen}
              >
                <ProjectCardAddContent
                  projectId={project.id}
                  subdomain={subdomain}
                  onCompleted={() => setIsAddPanelOpen(false)}
                  onUploadWidgetOpenChange={setIsUploadWidgetOpen}
                />
              </ProjectCardPanel>
            </>
          }
        />

        <CardContent>
          <ProjectCardSummary
            totalPendingAmount={totalPendingAmount}
            totalPlannedAmount={totalPlannedAmount}
            t={t}
            detailsTrigger={
              <ProjectCardPanel
                open={isDetailsPanelOpen}
                onOpenChange={setIsDetailsPanelOpen}
                trigger={detailsTrigger}
                title={project.name}
                description={t("project.itemsDescription")}
                contentClassName="sm:max-w-3xl max-h-[85vh] overflow-y-auto"
              >
                <ProjectCardDetailsContent
                  project={project}
                  plannedBacklog={plannedBacklog}
                  subdomain={subdomain}
                />
              </ProjectCardPanel>
            }
          />
        </CardContent>
      </Card>
    </>
  );
}
