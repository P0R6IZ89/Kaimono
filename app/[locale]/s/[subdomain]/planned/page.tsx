import { getPlannedBySubdomain } from "@/actions/plannedActions";
import React from "react";
import { DataTablePlanned } from "./table/data-table";
import { columnsPlanned } from "./table/columns";
import { getTranslations } from "next-intl/server";
import { CreatePlannedDialogTrigger } from "./dialogs/dialog-create-trigger";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";

export default async function Planned({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Planned" });
  const planned = await getPlannedBySubdomain(subdomain);
  return (
    <div className="py-4 space-y-8">
      <div className="px-4">
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
              <CreatePlannedDialogTrigger />
            </ItemTitle>
          </ItemContent>
        </Item>
      </div>
      <DataTablePlanned columns={columnsPlanned} data={planned} />
    </div>
  );
}
