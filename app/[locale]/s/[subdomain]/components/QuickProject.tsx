import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ArrowUpRight, Folder } from "lucide-react";
import React from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { countAllProjects } from "@/actions/projectActions";
import { ProjectCreateDialog } from "../projects/components/project-create-dialog";

async function QuickProjectCard({ subdomain }: { subdomain: string }) {
  const count = await countAllProjects(subdomain);
  const t = await getTranslations("ProjectsPage");

  return (
    <Card className="col-span-2 sm:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-end gap-2">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>

        <CardAction className="text-muted-foreground">
          <Folder />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-base">{t("count", { count })}</p>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <ProjectCreateDialog subdomain={subdomain} />
        <Button variant={"outline"} asChild>
          <Link href={"/projects"} className="col-auto">
            {t("see-all-projects")}
            <ArrowUpRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default QuickProjectCard;
