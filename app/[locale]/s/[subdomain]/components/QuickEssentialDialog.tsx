"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateEssentialDialog } from "../essentials/dialogs/dialog-create";
import { useTranslations } from "next-intl";

export function QuickEssentialDialog({
  className,
  buttonVariant = "outline",
}: {
  className?: string;
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}) {
  const t = useTranslations("EssentialsPage");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          className={`col-auto ${className || ""}`}
        >
          {t("add-essential-button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t("add-new-essential-item")}</DialogTitle>
          <DialogDescription>
            {t("add-new-essential-item-description")}
          </DialogDescription>
        </DialogHeader>
        <CreateEssentialDialog />
      </DialogContent>
    </Dialog>
  );
}
