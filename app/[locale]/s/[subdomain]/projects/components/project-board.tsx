"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "./project-card";
import {
  PlannedBacklogItem,
  ProjectWithPlanned,
} from "@/app/[locale]/types/projects";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  projects: ProjectWithPlanned[];
  plannedBacklog: PlannedBacklogItem[];
  subdomain: string;
};

export function ProjectBoard({ projects, plannedBacklog, subdomain }: Props) {
  const t = useTranslations("ProjectsPage");

  return (
    <section className="space-y-4">
      <Card className="shadow-none border-none">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle>{t("list.title")}</CardTitle>
            <CardDescription>{t("list.description")}</CardDescription>
          </div>
          <div>
            <Badge variant="outline">
              {t("list.backlog-count", { count: plannedBacklog.length })}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{t("empty.title")}</p>
          <p>{t("empty.description")}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              plannedBacklog={plannedBacklog}
              subdomain={subdomain}
            />
          ))}
        </div>
      )}
    </section>
  );
}
