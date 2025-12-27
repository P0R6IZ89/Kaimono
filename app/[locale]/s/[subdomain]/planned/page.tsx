import { getPlannedBySubdomain } from "@/actions/plannedActions";
import React from "react";
import { DataTablePlanned } from "./table/data-table";
import { columnsPlanned } from "./table/columns";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { CreatePlannedDialogTrigger } from "./dialogs/dialog-create-trigger";

export default async function Planned({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "PlannedPage" });
  const planned = await getPlannedBySubdomain(subdomain);
  return (
    <div className="p-4 space-y-8 mb-24 md:mb-0">
      <Card className="">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
          <CardAction>
            <CreatePlannedDialogTrigger buttonVariant="default" />
          </CardAction>
        </CardHeader>
      </Card>
      <DataTablePlanned columns={columnsPlanned} data={planned} />
    </div>
  );
}
