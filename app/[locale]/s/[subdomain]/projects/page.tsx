import {
  getProjectsWithPlanned,
  getUnassignedPlanned,
} from "@/actions/projectActions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getTranslations } from "next-intl/server";
import { Info } from "lucide-react";
import { ProjectBoard } from "./components/project-board";
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
      <Card className="border-muted/60 bg-muted/30">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <span>{t("title")}</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-sm">
                    <PopoverDescription>{t("description")}</PopoverDescription>
                  </PopoverContent>
                </Popover>
              </CardTitle>
              <Badge variant="outline">{projectCount} items</Badge>
            </div>
            <ProjectCreateDialog buttonVariant="default" subdomain={subdomain} />
          </div>
        </CardHeader>
      </Card>
      <ProjectBoard
        projects={projects}
        plannedBacklog={plannedBacklog}
        subdomain={subdomain}
      />
    </div>
  );
}
