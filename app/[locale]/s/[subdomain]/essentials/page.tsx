import React from "react";
import { getEssentialsBySubdomain } from "@/actions/essentialsActions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "./table/data-table";
import { columns } from "./table/essentials-columns";
import { getTranslations } from "next-intl/server";

interface EssentialsProps {
  params: Promise<{ subdomain: string; locale: string }>;
}

export default async function Essentials({ params }: EssentialsProps) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "EssentialsPage" });
  const essentials = await getEssentialsBySubdomain(subdomain);

  return (
    <section className="p-4 space-y-8 max-w-xl mb-24 md:mb-0">
      <Card className="shadow-none ">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
      </Card>
      <div>
        {essentials ? (
          <div className="space-y-8">
            <DataTable columns={columns} data={essentials} />
          </div>
        ) : (
          <div className="text-center">{t("no-essentials")}</div>
        )}
      </div>
    </section>
  );
}
