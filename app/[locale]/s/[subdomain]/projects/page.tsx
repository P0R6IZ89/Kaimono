import {
  getProjectsWithPlanned,
  getUnassignedPlanned,
} from "@/actions/projectActions";
import { getTranslations } from "next-intl/server";
import { ProjectBoard } from "./components/project-board";
import { ProjectCreateDialog } from "./components/project-create-dialog";
import {
  Item,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";

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
        variant={"default"}
        className="flex flex-col items-start lg:flex-row lg:items-center"
      >
        <ItemContent className="w-full">
          <ItemTitle className="flex w-full justify-between">
            <div className="flex items-center gap-2">
              <p>{t("title")}</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground"
                    aria-label={t("description")}
                  >
                    <Info className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-w-sm text-sm" align="start">
                  {t("description")}
                </PopoverContent>
              </Popover>
            </div>
            <ProjectCreateDialog buttonVariant="outline" />
          </ItemTitle>
        </ItemContent>
      </Item>
      <ProjectBoard
        projects={projects}
        plannedBacklog={plannedBacklog}
        subdomain={subdomain}
      />
    </div>
  );
}
