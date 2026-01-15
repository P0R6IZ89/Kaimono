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
          <CardTitle className="text-base text-foreground flex flex-row gap-2 items-start ">
            <div className="flex-1 flex flex-col">
              <p>
                {user?.name ? t("hello", { userName: user.name }) : t("hello2")}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <UserList subdomain={subdomain} />
          </CardTitle>
        </CardHeader>
      </Card>
      <div className="flex flex-col gap-3">
        <QuickProjectCard subdomain={subdomain} />
        <QuickPlannedCard subdomain={subdomain} />
        <QuickEssentialCard subdomain={subdomain} />
      </div>
    </div>
  );
}
