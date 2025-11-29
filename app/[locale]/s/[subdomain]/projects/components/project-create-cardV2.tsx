"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { ProjectCreateDialog } from "./project-create-dialog";

type Props = { subdomain: string };

export function ProjectCreateCardV2({ subdomain }: Props) {
  const t = useTranslations("ProjectsPage");

  return (
    <Card className="flex flex-col gap-4 justify-center ">
      <CardHeader className="text-center">
        <CardTitle className="inline-flex justify-center items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {t("create.title")}
        </CardTitle>
        <CardDescription>{t("create.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ProjectCreateDialog subdomain={subdomain} />
      </CardContent>
    </Card>
  );
}
