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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProjectCardAddTabsContent } from "./project-card-add-tabs-content";
import { ProjectCardDetailsContent } from "./project-card-details-content";
import { ProjectEditDialog } from "./project-edit-dialog";

type Props = {
  project: ProjectWithPlanned;
  plannedBacklog: PlannedBacklogItem[];
  subdomain: string;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(price ?? 0);

export function ProjectCard({ project, plannedBacklog, subdomain }: Props) {
  const t = useTranslations("ProjectsPage");
  const isMobile = useIsMobile();

  const [openDetails, setOpenDetails] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [uploadWidgetOpen, setUploadWidgetOpen] = useState(false);

  const totalPlannedAmount = project.plannedItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
    0,
  );

  const addTrigger = (
    <Button variant="outline" size="sm">
      <Plus className="h-4 w-4" />
      {t("project.add-cta")}
    </Button>
  );

  const viewAllTrigger = (
    <Button variant="outline" size="sm">
      {t("project.view-all")}
    </Button>
  );

  return (
    <Card className="border border-muted shadow-sm">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex w-full justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            {project.name}
            <ProjectEditDialog project={project} />
          </CardTitle>

          {isMobile ? (
            <Drawer
              open={openAdd}
              dismissible={!uploadWidgetOpen}
              onOpenChange={(nextOpen) => {
                if (uploadWidgetOpen && !nextOpen) return;
                setOpenAdd(nextOpen);
              }}
            >
              <DrawerTrigger asChild>{addTrigger}</DrawerTrigger>
              <DrawerContent className="md:w-2xl mx-auto pb-6">
                <div className="w-full mx-auto max-h-[80vh] overflow-y-auto">
                  <DrawerHeader>
                    <DrawerTitle>
                      {t("add.title", { projectName: project.name })}
                    </DrawerTitle>
                    <DrawerDescription>
                      {t("add.description")}
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 pb-4">
                    <ProjectCardAddTabsContent
                      projectId={project.id}
                      projectName={project.name}
                      subdomain={subdomain}
                      plannedBacklog={plannedBacklog}
                      onCompleted={() => setOpenAdd(false)}
                      onUploadWidgetOpenChange={setUploadWidgetOpen}
                    />
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={openAdd} onOpenChange={setOpenAdd} modal={false}>
              <DialogTrigger asChild>{addTrigger}</DialogTrigger>
              <DialogContent
                className="sm:max-w-2xl max-h-[80vh] overflow-y-auto"
                onInteractOutside={(event) => {
                  if (uploadWidgetOpen) event.preventDefault();
                }}
                onPointerDownOutside={(event) => {
                  if (uploadWidgetOpen) event.preventDefault();
                }}
                onFocusOutside={(event) => {
                  if (uploadWidgetOpen) event.preventDefault();
                }}
              >
                <DialogHeader>
                  <DialogTitle>
                    {t("add.title", { projectName: project.name })}
                  </DialogTitle>
                  <DialogDescription>{t("add.description")}</DialogDescription>
                </DialogHeader>
                <ProjectCardAddTabsContent
                  projectId={project.id}
                  projectName={project.name}
                  subdomain={subdomain}
                  plannedBacklog={plannedBacklog}
                  onCompleted={() => setOpenAdd(false)}
                  onUploadWidgetOpenChange={setUploadWidgetOpen}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {project.counts.total ? (
              <Badge variant="secondary">
                {t("project.badges.total", { count: project.counts.total })}
              </Badge>
            ) : null}
            {project.counts.pending ? (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                {t("project.badges.pending", {
                  count: project.counts.pending,
                })}
              </Badge>
            ) : null}
            {project.counts.purchased ? (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                {t("project.badges.purchased", {
                  count: project.counts.purchased,
                })}
              </Badge>
            ) : null}
            {project.counts.cancelled ? (
              <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">
                {t("project.badges.cancelled", {
                  count: project.counts.cancelled,
                })}
              </Badge>
            ) : null}
          </div>

          {project.description ? (
            <CardDescription>{project.description}</CardDescription>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {totalPlannedAmount !== 0 ? (
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-xl">
                {formatPrice(totalPlannedAmount)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("project.total-value")}
              </span>
            </div>
          ) : null}

          {isMobile ? (
            <Drawer open={openDetails} onOpenChange={setOpenDetails}>
              <DrawerTrigger asChild>{viewAllTrigger}</DrawerTrigger>
              <DrawerContent className="md:w-2xl mx-auto pb-6">
                <div className="w-full mx-auto max-h-[80vh] overflow-y-auto">
                  <DrawerHeader>
                    <DrawerTitle className="text-lg font-semibold tracking-tight">
                      {project.name}
                    </DrawerTitle>
                    <DrawerDescription>
                      {t("project.items-description")}
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 pb-4">
                    <ProjectCardDetailsContent
                      project={project}
                      subdomain={subdomain}
                    />
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={openDetails} onOpenChange={setOpenDetails}>
              <DialogTrigger asChild>{viewAllTrigger}</DialogTrigger>
              <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{project.name}</DialogTitle>
                  <DialogDescription>
                    {t("project.items-description")}
                  </DialogDescription>
                </DialogHeader>
                <ProjectCardDetailsContent
                  project={project}
                  subdomain={subdomain}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
