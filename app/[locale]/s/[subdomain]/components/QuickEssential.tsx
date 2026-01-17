import { getEssentialCount } from "@/actions/essentialsActions";
import { ChevronRight, Plus, ShoppingCart } from "lucide-react";
import React from "react";
import { QuickEssentialDialog } from "./QuickEssentialDialog";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

async function QuickEssentialCard({ subdomain }: { subdomain: string }) {
  const count = await getEssentialCount(subdomain);
  const t = await getTranslations("EssentialsPage");

  return (
    <div className="flex items-stretch gap-2">
      <Item variant={"outline"} asChild>
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
          <ItemActions>
            {count !== 0 && <Badge variant="outline">{count}</Badge>}
          </ItemActions>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </Item>
      <QuickEssentialDialog
        className="p-2 h-full aspect-square rounded-md"
        buttonVariant="outline"
      >
        <Plus />
      </QuickEssentialDialog>
    </div>
  );
}

export default QuickEssentialCard;
