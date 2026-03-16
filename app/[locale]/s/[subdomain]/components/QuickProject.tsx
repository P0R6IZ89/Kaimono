import { ChevronRight, Layers } from "lucide-react";
import React from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

async function QuickProjectCard() {
  const t = await getTranslations("Projects");

  return (
    <div className="flex items-stretch gap-2">
      <Item className="flex-1" asChild>
        <Link href={"/projects"} prefetch={true}>
          <ItemMedia
            className="text-background dark:text-foreground rounded-md p-1.5 bg-primary"
            variant={"icon"}
          >
            <Layers />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{t("title")}</ItemTitle>
          </ItemContent>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </Item>
    </div>
  );
}

export default QuickProjectCard;
