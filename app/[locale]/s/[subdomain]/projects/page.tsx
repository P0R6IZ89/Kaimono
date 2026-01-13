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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ProjectCreateDialog } from "./components/project-create-dialog";

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
    <div className="p-4 space-y-6 mb-24 md:mb-0">
      <Item variant={"muted"} className="bg-transparent">
        <ItemContent>
          <ItemTitle>
            {t("title")}
            {projectCount !== 0 && (
              <Badge variant="secondary">{projectCount}</Badge>
            )}
          </ItemTitle>
          <ItemDescription>{t("description")}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ProjectCreateDialog buttonVariant="default" subdomain={subdomain} />
        </ItemActions>
      </Item>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="col-span-2 md:col-span-3 lg:col-span-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="backlog">
              <CardHeader>
                <CardTitle className="flex gap-2 ">
                  <p>{t("backlog.title")}</p>
                  {plannedBacklog.length > 0 && (
                    <Badge variant="secondary">{plannedBacklog.length}</Badge>
                  )}
                </CardTitle>
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
