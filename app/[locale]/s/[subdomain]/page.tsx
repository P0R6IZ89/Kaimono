import React from "react";
import QuickEssentialCard from "./components/QuickEssential";
import QuickPlannedCard from "./components/QuickPlanned";
import InviteToastHandler from "./components/InviteToastHandler";
import { requireSession } from "@/actions/appActions";
import { getTranslations } from "next-intl/server";
import UserList from "@/components/client/userList";
import QuickProjectCard from "./components/QuickProject";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Greetings } from "./components/greetings";

export default async function Essentials({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });

  const { user } = await requireSession();

  return (
    <div className="max-w-3xl flex flex-col gap-4 mb-24 md:mb-0 p-4">
      <InviteToastHandler />
      <Item variant={"muted"}>
        <ItemContent className="gap-0">
          <ItemTitle>
            <Greetings />
          </ItemTitle>
          <ItemDescription>{user?.email}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <UserList subdomain={subdomain} />
        </ItemActions>
      </Item>
      {/* <div className="flex flex-row items-center justify-between">
        <HomeCarousel />
      </div> */}
      <div className="flex flex-col gap-1">
        <p className="py-2">{t("Home")}</p>
        <div className="flex flex-col border gap-0 bg-muted/50 rounded-sm">
          <QuickProjectCard />
          <QuickEssentialCard />
        </div>
        <QuickPlannedCard />
      </div>
    </div>
  );
}
