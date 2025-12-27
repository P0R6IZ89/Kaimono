"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreatePlannedDialog } from "./dialog-create";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

export function CreatePlannedDialogTrigger({
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
  const t = useTranslations("PlannedPage");
  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          className={`col-auto ${className || ""}`}
        >
          <Plus className="" />
          {t("add-planned-button")}
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-106.25"
      >
        <DialogHeader>
          <DialogTitle>{t("add-new-planned-item")}</DialogTitle>
          <DialogDescription>
            {t("add-new-planned-item-description")}
          </DialogDescription>
        </DialogHeader>
        <CreatePlannedDialog />
      </DialogContent>
    </Dialog>
  );
}
