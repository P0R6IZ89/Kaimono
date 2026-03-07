import {
  getProjectsWithPlanned,
  getUnassignedPlanned,
} from "@/actions/projectActions";
import { getTranslations } from "next-intl/server";
import { ProjectBoard } from "./components/project-board";
import { ProjectCreateDialog } from "./components/project-create-dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

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

  return (
    <div className="p-4 space-y-6 mb-24 md:mb-0">
      <Item
        variant={"muted"}
        className="flex flex-col items-start lg:flex-row lg:items-center"
      >
        <ItemContent>
          <ItemTitle>{t("title")}</ItemTitle>
          <ItemDescription>{t("description")}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ProjectCreateDialog buttonVariant="outline" />
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
