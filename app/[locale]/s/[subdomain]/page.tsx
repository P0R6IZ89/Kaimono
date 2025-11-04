import React from "react";
import MembersCard from "./components/MembersCard";
import QuickEssentialCard from "./components/QuickEssential";
import QuickPlannedCard from "./components/QuickPlanned";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InviteToastHandler from "./components/InviteToastHandler";
import { requireSession } from "@/actions/appActions";
import { getTranslations } from "next-intl/server";

export default async function Essentials({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const { user } = await requireSession();
  const t = await getTranslations("Dashboard");
  return (
    <div className="@container max-w-5xl flex flex-col p-4 space-y-4 ">
      <InviteToastHandler />
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardDescription>
            {user?.name ? t("hello", { userName: user.name }) : t("hello2")}
          </CardDescription>
          <CardTitle className="font-normal">{t("welcomeBack")}</CardTitle>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <MembersCard subdomain={subdomain} />
        <QuickEssentialCard subdomain={subdomain} />
        <QuickPlannedCard subdomain={subdomain} />
      </div>
    </div>
  );
}
