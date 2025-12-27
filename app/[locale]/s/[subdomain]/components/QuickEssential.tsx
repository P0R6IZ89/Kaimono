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
import { ArrowUpRight, Shirt } from "lucide-react";
import React from "react";
import { QuickEssentialDialog } from "./QuickEssentialDialog";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";

async function QuickEssentialCard({ subdomain }: { subdomain: string }) {
  const count = await getEssentialCount(subdomain);
  const t = await getTranslations("EssentialsPage");

  return (
    <Card className="col-span-2 sm:col-span-1">
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
    </Card>
  );
}

export default QuickEssentialCard;
