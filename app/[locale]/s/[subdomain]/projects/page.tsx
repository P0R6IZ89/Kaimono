import {
  getProjectsWithPlanned,
  getUnassignedPlanned,
} from "@/actions/projectActions";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { ProjectBoard } from "./components/project-board";
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
      <Item variant={"muted"} className="flex flex-col items-start lg:flex-row">
        <ItemContent>
          <ItemTitle>
            {t("title")}
            {projectCount !== 0 && (
              <Badge variant="outline">{projectCount}</Badge>
            )}
          </ItemTitle>
          <ItemDescription>{t("description")}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ProjectCreateDialog buttonVariant="default" subdomain={subdomain} />
        </ItemActions>
      </Item>
      <ProjectBoard
        projects={projects}
        plannedBacklog={plannedBacklog}
        subdomain={subdomain}
      />
    </div>
  );
}
