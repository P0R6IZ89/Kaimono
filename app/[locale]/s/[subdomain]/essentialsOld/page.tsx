import React from "react";
import { getEssentialsBySubdomain } from "@/actions/essentialsActions";
import { DataTable } from "./table/data-table";
import { columns } from "./table/essentials-columns";
import { getTranslations } from "next-intl/server";
import { CreateEssentialDialogTrigger } from "./dialogs/dialog-create-trigger";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

interface EssentialsProps {
  params: Promise<{ subdomain: string; locale: string }>;
}

export default async function Essentials({ params }: EssentialsProps) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Essentials" });
  const essentials = await getEssentialsBySubdomain(subdomain);

  return (
    <section className="p-4 space-y-8 mb-24 md:mb-0">
      <Item
        variant={"muted"}
        className="flex flex-col items-start lg:flex-row lg:items-center"
      >
        <ItemContent>
          <ItemTitle>{t("title")}</ItemTitle>
          <ItemDescription>{t("description")}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <CreateEssentialDialogTrigger />
        </ItemActions>
      </Item>

      <div className="flex flex-col gap-4">
        <div>
          {essentials ? (
            <div className="space-y-8">
              <DataTable columns={columns} data={essentials} />
            </div>
          ) : (
            <div className="text-center">{t("empty.list")}</div>
          )}
        </div>
      </div>
    </section>
  );
}
