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
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import HomeCarousel from "./components/HomeCarousel";

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
      <Item>
        <ItemMedia variant="image">👋</ItemMedia>
        <ItemContent className="gap-0">
          <ItemTitle>
            {user?.name ? t("hello", { userName: user.name }) : t("hello2")}
          </ItemTitle>
          <ItemDescription>{user?.email}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <UserList subdomain={subdomain} />
        </ItemActions>
      </Item>
      <div className="flex flex-row items-center justify-between">
        <HomeCarousel />
      </div>
      <div className="flex flex-col gap-3">
        <QuickProjectCard subdomain={subdomain} />
        <QuickPlannedCard subdomain={subdomain} />
        <QuickEssentialCard subdomain={subdomain} />
      </div>
    </div>
  );
}
