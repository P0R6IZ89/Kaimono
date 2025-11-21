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
import { Plus } from "lucide-react";
import { CreateEssentialDialog } from "./dialog-create";
import { useTranslations } from "next-intl";

export function CreateEssentialDialogTrigger() {
  const t = useTranslations("EssentialsPage");
  const tTable = useTranslations("Table");
  return (
    <div className="space-y-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="h-8 px-2 lg:px-3">
            <Plus />
            <span>{tTable("add")}</span>
          </Button>
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>{t("add-new-essential-item")}</DialogTitle>
            <DialogDescription>
              {t("add-new-essential-item-description")}
            </DialogDescription>
          </DialogHeader>
          <CreateEssentialDialog />
        </DialogContent>
      </Dialog>
    </div>
  );
}
