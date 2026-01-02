import React from "react";
import {
  getEssentialCount,
  getEssentialsBySubdomain,
  getEssentialsPendingTotalExpense,
} from "@/actions/essentialsActions";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "./table/data-table";
import { columns } from "./table/essentials-columns";
import { getTranslations } from "next-intl/server";
import { CreateEssentialDialogTrigger } from "./dialogs/dialog-create-trigger";
import { formatPriceYen } from "@/util/formatPriceYen";

interface EssentialsProps {
  params: Promise<{ subdomain: string; locale: string }>;
}

export default async function Essentials({ params }: EssentialsProps) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "EssentialsPage" });
  const essentials = await getEssentialsBySubdomain(subdomain);
  const count = await getEssentialCount(subdomain);
  const totalExpense = await getEssentialsPendingTotalExpense(subdomain);

  return (
    <section className="p-4 space-y-8 mb-24 md:mb-0">
      <Card className="">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
          <CardAction>
            <CreateEssentialDialogTrigger />
          </CardAction>
        </CardHeader>
      </Card>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Pending Items</CardDescription>
              <CardTitle className="text-xl font-semibold">{count}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Pending </CardDescription>
              <CardTitle className="text-xl font-semibold">
                {formatPriceYen(totalExpense)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
        <div>
          {essentials ? (
            <div className="space-y-8">
              <DataTable columns={columns} data={essentials} />
            </div>
          ) : (
            <div className="text-center">{t("no-essentials")}</div>
          )}
        </div>
      </div>
    </section>
  );
}
