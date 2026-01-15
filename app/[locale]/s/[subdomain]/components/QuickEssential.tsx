import { getEssentialCount } from "@/actions/essentialsActions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  ChevronRight,
  Plus,
  Shirt,
  ShoppingCart,
} from "lucide-react";
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
            className="text-background dark:text-foreground rounded-md p-1.5 bg-blue-500"
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
      {/* <Card className="col-span-2 sm:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("title")}
            {count !== 0 && <Badge variant="outline">{count}</Badge>}
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
          <CardAction className="text-muted-foreground">
            <Shirt />
          </CardAction>
        </CardHeader>
        <CardFooter className="grid grid-cols-2 gap-2">
          {count !== 0 ? (
            <>
              <QuickEssentialDialog />
              <Button variant={"outline"} asChild>
                <Link href={"/essentials"} className="col-auto">
                  {t("see-all-essentials")}
                  <ArrowUpRight />
                </Link>
              </Button>
            </>
          ) : (
            <QuickEssentialDialog
              className="col-span-2"
              buttonVariant="default"
            />
          )}
        </CardFooter>
      </Card> */}
    </div>
  );
}

export default QuickEssentialCard;
