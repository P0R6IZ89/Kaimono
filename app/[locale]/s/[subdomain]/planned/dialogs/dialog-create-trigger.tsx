"use client";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [uploadWidgetOpen, setUploadWidgetOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          className={`col-auto ${className || ""}`}
        >
          {children ? children : t("add-new-planned-item")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-106.25"
        onInteractOutside={(e) => {
          if (uploadWidgetOpen) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (uploadWidgetOpen) e.preventDefault();
        }}
        onFocusOutside={(e) => {
          if (uploadWidgetOpen) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("add-new-planned-item")}</DialogTitle>
          <DialogDescription>
            {t("add-new-planned-item-description")}
          </DialogDescription>
        </DialogHeader>
        <CreatePlannedDialog onUploadWidgetOpenChange={setUploadWidgetOpen} />
      </DialogContent>
    </Dialog>
  );
}
