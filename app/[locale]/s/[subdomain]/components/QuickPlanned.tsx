import { getPlannedCount } from "@/actions/plannedActions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Armchair, ArrowUpRight, Plus } from "lucide-react";
import React from "react";
import { CreatePlannedDialogTrigger } from "../planned/dialogs/dialog-create-trigger";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

async function QuickPlannedCard({ subdomain }: { subdomain: string }) {
  const t = await getTranslations("PlannedPage");
  const count = await getPlannedCount(subdomain);

  return (
    <Card className="col-span-2 sm:col-span-1">
      <CardHeader>
        <CardDescription>
          <p>{t("title")}</p>
        </CardDescription>
        <CardTitle className="flex items-end gap-2 text-2xl font-normal">
          {t("plannedCount", { count })}
        </CardTitle>
        <CardAction className="text-muted-foreground">
          <Armchair />
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter className="flex-1 gap-2">
        <CreatePlannedDialogTrigger>
          <Button variant={"default"}>
            <Plus />
            {t("add-planned-button")}
          </Button>
        </CreatePlannedDialogTrigger>

        <Button variant={"outline"} asChild>
          <Link href={"/planned"}>
            {t("see-all-planned")}
            <ArrowUpRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default QuickPlannedCard;
