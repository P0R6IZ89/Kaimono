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

export function CreatePlannedDialogTrigger({
  className,
  buttonVariant = "default",
  children,
}: {
  className?: string;
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  children?: React.ReactNode;
}) {
  const t = useTranslations("PlannedPage");
  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          className={`col-auto ${className || ""}`}
        >
          {children ? children : t("add-new-planned-item")}
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
