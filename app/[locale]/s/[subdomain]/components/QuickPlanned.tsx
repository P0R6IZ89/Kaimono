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
        <CardTitle className="flex items-end gap-2 ">
          <p>{t("title")}</p>
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
        <CardAction className="text-muted-foreground">
          <Armchair />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>{t("plannedCount", { count })}</p>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <CreatePlannedDialogTrigger>
          <Button variant={"default"} className="col-auto">
            <Plus />
            {t("add-planned-button")}
          </Button>
        </CreatePlannedDialogTrigger>

        <Button variant={"outline"} asChild>
          <Link href={"/planned"} className="col-auto">
            {t("see-all-planned")}
            <ArrowUpRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default QuickPlannedCard;
