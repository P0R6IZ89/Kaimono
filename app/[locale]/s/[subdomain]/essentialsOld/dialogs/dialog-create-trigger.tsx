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

export function CreateEssentialDialogTrigger({
  children,
  className,
  buttonVariant = "default",
  triggerRef,
}: {
  children?: React.ReactNode;
  className?: string;
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  triggerRef?: React.Ref<HTMLButtonElement>;
}) {
  const t = useTranslations("Essentials");
  const tCommon = useTranslations("Common");
  return (
    <div className="space-y-8">
      <Dialog>
        <DialogTrigger asChild>
          {children ? (
            children
          ) : (
            <Button
              ref={triggerRef}
              variant={buttonVariant}
              className={`h-8 px-2 lg:px-3 ${className || ""}`}
            >
              <Plus />
              <span>{tCommon("actions.add")}</span>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>{t("create.title")}</DialogTitle>
            <DialogDescription>{t("create.description")}</DialogDescription>
          </DialogHeader>
          <CreateEssentialDialog />
        </DialogContent>
      </Dialog>
    </div>
  );
}
