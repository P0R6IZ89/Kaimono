import React from "react";
import QuickEssentialCard from "./components/QuickEssential";
import QuickPlannedCard from "./components/QuickPlanned";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import InviteToastHandler from "./components/InviteToastHandler";
import { requireSession } from "@/actions/appActions";
import { getTranslations } from "next-intl/server";
import UserList from "@/components/client/userList";
import QuickProjectCard from "./components/QuickProject";
import { Separator } from "@/components/ui/separator";

export default async function Essentials({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  const { user } = await requireSession();

  return (
    <div className="@container max-w-5xl flex flex-col gap-6 p-4 space-y-4 mb-24 md:mb-0">
      <InviteToastHandler />

      <Card className="">
        <CardHeader>
          <CardTitle className="text-base text-foreground flex flex-col gap-2 items-start md:flex-row md:justify-between md:items-center">
            <div>
              {user?.name ? t("hello", { userName: user.name }) : t("hello2")}
            </div>
            <UserList subdomain={subdomain} />
          </CardTitle>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <p className="text-xl font-semibold col-span-2 px-4">
          {t("mainFeature")}
        </p>
        <QuickProjectCard subdomain={subdomain} />
        <QuickPlannedCard subdomain={subdomain} />
        <Separator className="col-span-2 my-8" />
        {/* <p className="text-xl font-semibold col-span-2 px-4 pt-6">
          Shopping List
        </p> */}
        <QuickEssentialCard subdomain={subdomain} />
      </div>
    </div>
  );
}
