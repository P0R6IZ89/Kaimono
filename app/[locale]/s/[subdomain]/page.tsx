import React from "react";
import QuickEssentialCard from "./components/QuickEssential";
import QuickPlannedCard from "./components/QuickPlanned";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import InviteToastHandler from "./components/InviteToastHandler";
import { requireSession } from "@/actions/appActions";
import { getTranslations } from "next-intl/server";
import UserList from "@/components/client/userList";
import QuickProjectCard from "./components/QuickProject";

export default async function Essentials({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  const { user } = await requireSession();

  return (
    <div className="@container max-w-5xl flex flex-col p-4 space-y-4 mb-24 md:mb-0">
      <InviteToastHandler />
      <Card className="border-none shadow-none ring-0 bg-transparent">
        <CardHeader>
          <CardDescription className="text-sm text-muted-foreground flex flex-col gap-2 items-start md:flex-row md:justify-between md:items-center">
            <div>
              {user?.name ? t("hello", { userName: user.name }) : t("hello2")}
            </div>
            <UserList subdomain={subdomain} />
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <QuickProjectCard subdomain={subdomain} />
        <QuickEssentialCard subdomain={subdomain} />
        <QuickPlannedCard subdomain={subdomain} />
      </div>
    </div>
  );
}
