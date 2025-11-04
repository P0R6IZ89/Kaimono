import { getPlannedBySubdomain } from "@/actions/plannedActions";
import React from "react";
import { DataTablePlanned } from "./table/data-table";
import { columnsPlanned } from "./table/columns";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function Planned({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "PlannedPage" });
  const planned = await getPlannedBySubdomain(subdomain);
  return (
    <div className="p-4 space-y-8 max-w-xl">
      <Card className="shadow-none ">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
      </Card>
      <div className="space-y-8">
        <DataTablePlanned columns={columnsPlanned} data={planned} />
      </div>
    </div>
  );
}
