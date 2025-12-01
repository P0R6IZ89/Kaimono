import React from "react";
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
import UserList from "@/components/client/userList";
import QuickProjectCard from "./components/QuickProject";
// import ExpenseBarEditor from "./components/ExpenseBar";

export default async function Essentials({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  const { user } = await requireSession();

  return (
    <div className="@container max-w-5xl flex flex-col p-4 space-y-4 ">
      <InviteToastHandler />
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardDescription>
            {user?.name ? t("hello", { userName: user.name }) : t("hello2")}
          </CardDescription>
          <CardTitle className="grid grid-cols-2 justify-between items-center font-normal">
            <p>{t("welcomeBack")}</p>
            <UserList subdomain={subdomain} />
          </CardTitle>
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
