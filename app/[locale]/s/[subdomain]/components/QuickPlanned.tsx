import { getPlannedCount } from "@/actions/plannedActions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Armchair, ArrowUpRight } from "lucide-react";
import React from "react";
import { CreatePlannedDialogTrigger } from "../planned/dialogs/dialog-create-trigger";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

async function QuickPlannedCard({ subdomain }: { subdomain: string }) {
  const t = await getTranslations("PlannedPage");
  const count = await getPlannedCount(subdomain);

  return (
    <Card className="col-span-2 sm:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 ">
          {t("title")}
          {count !== 0 && <Badge variant="outline">{count}</Badge>}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
        <CardAction className="text-muted-foreground">
          <Armchair />
        </CardAction>
      </CardHeader>
      {/* <CardContent>
        <p>{t("plannedCount", { count })}</p>
      </CardContent> */}
      <CardFooter className="grid grid-cols-2 gap-2">
        {count !== 0 ? (
          <>
            <CreatePlannedDialogTrigger />

            <Button variant={"outline"} asChild>
              <Link href={"/planned"} className="col-auto">
                {t("see-all-planned")}
                <ArrowUpRight />
              </Link>
            </Button>
          </>
        ) : (
          <CreatePlannedDialogTrigger
            className="col-span-2"
            buttonVariant="default"
          />
        )}
      </CardFooter>
    </Card>
  );
}

export default QuickPlannedCard;
