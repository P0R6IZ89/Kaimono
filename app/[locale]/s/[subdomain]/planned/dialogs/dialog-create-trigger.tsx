"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreatePlannedDialog } from "./dialog-create";
import React from "react";
import { useTranslations } from "next-intl";

export function CreatePlannedDialogTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("PlannedPage");
  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-[425px]"
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
