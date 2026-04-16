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
  const t = useTranslations("Essentials");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          className={`col-auto ${className || ""}`}
        >
          {children ? children : t("create.title")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t("create.title")}</DialogTitle>
          <DialogDescription>{t("create.description")}</DialogDescription>
        </DialogHeader>
        <CreateEssentialDialog />
      </DialogContent>
    </Dialog>
  );
}
