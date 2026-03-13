import { ChevronRight, Sofa } from "lucide-react";
import React from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

async function QuickPlannedCard() {
  const t = await getTranslations("PlannedPage");

  return (
    <div className="flex items-stretch gap-2">
      <Item asChild>
        <Link href={"/planned"} prefetch={true}>
          <ItemMedia
            className="text-background dark:text-foreground rounded-md p-1.5 bg-blue-600"
            variant={"icon"}
          >
            <Sofa />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{t("title")}</ItemTitle>
          </ItemContent>
          {/* <ItemActions>
            <Badge variant="outline">{count}</Badge>
          </ItemActions> */}
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </Item>
    </div>
  );
}

export default QuickPlannedCard;
