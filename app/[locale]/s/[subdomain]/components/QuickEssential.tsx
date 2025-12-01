import { getEssentialCount } from "@/actions/essentialsActions";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpRight, Shirt } from "lucide-react";
import React from "react";
import { CreateEssentialDialog } from "../essentials/dialogs/dialog-create";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

async function QuickEssentialCard({ subdomain }: { subdomain: string }) {
  const count = await getEssentialCount(subdomain);
  const t = await getTranslations("EssentialsPage");

  return (
    <Card className="col-span-2 sm:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-end gap-2">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
        <CardAction className="text-muted-foreground">
          <Shirt />
        </CardAction>
      </CardHeader>
      <CardContent>{t("essentialsCount", { count })}</CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={"default"} className="col-auto ">
              {t("add-essential-button")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("add-new-essential-item")}</DialogTitle>
              <DialogDescription>
                {t("add-new-essential-item-description")}
              </DialogDescription>
            </DialogHeader>
            <CreateEssentialDialog />
          </DialogContent>
        </Dialog>
        <Button variant={"outline"} asChild>
          <Link href={"/essentials"} className="col-auto">
            {t("see-all-essentials")}
            <ArrowUpRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default QuickEssentialCard;
