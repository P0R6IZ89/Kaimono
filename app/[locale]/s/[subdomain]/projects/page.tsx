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
import { ProjectBoard } from "./components/project-board";
import { ProjectCreateCardV2 } from "./components/project-create-cardV2";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      <Card className="shadow-none ring-0 bg-transparent">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {t("summary.projects", { count: projectCount })}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
        <ProjectCreateCardV2 subdomain={subdomain} />
        <Card>
          <Accordion type="single" collapsible>
            <AccordionItem value="backlog">
              <CardHeader>
                <CardTitle className="">{t("backlog.title")}</CardTitle>
                <AccordionTrigger className="p-0 mb-3 hover:no-underline">
                  <CardDescription>{t("backlog.description")}</CardDescription>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent asChild>
                <CardContent className="space-y-2">
                  {plannedBacklog.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("backlog.empty")}
                    </p>
                  ) : (
                    plannedBacklog.slice(0, 3).map((item) => (
                      <div key={item.id}>
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border bg-background p-3"
                        >
                          <div className="space-y-1">
                            <p className="font-medium leading-none">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
