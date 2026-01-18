import { getPlannedBySubdomain } from "@/actions/plannedActions";
import React from "react";
import { DataTablePlanned } from "./table/data-table";
import { columnsPlanned } from "./table/columns";
import { getTranslations } from "next-intl/server";
import { CreatePlannedDialogTrigger } from "./dialogs/dialog-create-trigger";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

export default async function Planned({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "PlannedPage" });
  const planned = await getPlannedBySubdomain(subdomain);
  return (
    <div className="py-4 space-y-8">
      <div className="px-4">
        <Item
          variant={"muted"}
          className="flex flex-col items-start lg:flex-row lg:items-center"
        >
          <ItemContent>
            <ItemTitle>{t("title")}</ItemTitle>
            <ItemDescription>{t("description")}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <CreatePlannedDialogTrigger />
          </ItemActions>
        </Item>
      </div>
      <DataTablePlanned columns={columnsPlanned} data={planned} />
    </div>
  );
}
