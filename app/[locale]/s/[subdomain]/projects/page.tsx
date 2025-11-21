import {
  getProjectsWithPlanned,
  getUnassignedPlanned,
} from "@/actions/projectActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { ProjectCreateCard } from "./components/project-create-card";
import { ProjectBoard } from "./components/project-board";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProjectsPage" });

  const [projects, plannedBacklog] = await Promise.all([
    getProjectsWithPlanned(subdomain),
    getUnassignedPlanned(subdomain),
  ]);

  const projectCount = projects.length;

  return (
    <div className="p-4 space-y-6">
      <Card className="shadow-none">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">
              {t("summary.projects", { count: projectCount })}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <ProjectCreateCard subdomain={subdomain} />
        <Card>
          <CardHeader>
            <CardTitle className="">{t("backlog.title")}</CardTitle>
            <CardDescription>{t("backlog.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {plannedBacklog.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("backlog.empty")}
              </p>
            ) : (
              plannedBacklog.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border bg-background p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.priority} · {item.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <ProjectBoard
        projects={projects}
        plannedBacklog={plannedBacklog}
        subdomain={subdomain}
      />
    </div>
  );
}
