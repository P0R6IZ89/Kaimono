import { ChevronRight, ShoppingCart } from "lucide-react";
import React from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

async function QuickEssentialCard() {
  const t = await getTranslations("Essentials");

  return (
    <div className="flex items-stretch gap-2">
      <Item asChild>
        <Link href={"/essentials"} prefetch={true}>
          <ItemMedia
            className="text-background dark:text-foreground rounded-md p-1.5 bg-green-600"
            variant={"icon"}
          >
            <ShoppingCart />
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

export default QuickEssentialCard;
