import React from "react";
import { getEssentialsBySubdomain } from "@/actions/essentialsActions";
import { requireSession } from "@/actions/appActions";
import { getTranslations } from "next-intl/server";
import { CreateEssentialDialogTrigger } from "../essentials/dialogs/dialog-create-trigger";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ChatField } from "./chat-field";

interface EssentialsProps {
  params: Promise<{ subdomain: string; locale: string }>;
}

export default async function Essentials({ params }: EssentialsProps) {
  const { subdomain, locale } = await params;
  const session = await requireSession();
  const t = await getTranslations({ locale, namespace: "EssentialsPage" });
  const essentials = await getEssentialsBySubdomain(subdomain);

  return (
    <section className="p-4 space-y-8 mb-24 md:mb-0">
      <Item
        variant={"muted"}
        className="flex flex-col items-start md:flex-row md:items-center"
      >
        <ItemContent>
          <ItemTitle>{t("title")}</ItemTitle>
          <ItemDescription>{t("description")}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <CreateEssentialDialogTrigger />
        </ItemActions>
      </Item>

      <ChatField essentials={essentials} currentUserId={session.user.id} />
    </section>
  );
}
