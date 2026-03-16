"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreatePlannedDialog } from "./dialog-create";
import { useTranslations } from "next-intl";
import { ResponsiveDialogDrawer } from "@/components/dialog/responsive-dialog-drawer";

export function CreatePlannedDialogTrigger({
  className,
  buttonVariant = "default",
  children,
  triggerRef,
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
  triggerRef?: React.Ref<HTMLButtonElement>;
}) {
  const t = useTranslations("Planned");
  const [open, setOpen] = useState(false);
  const [uploadWidgetOpen, setUploadWidgetOpen] = useState(false);

  return (
    <ResponsiveDialogDrawer
      open={open}
      onOpenChange={setOpen}
      title={t("create.title")}
      description={t("create.description")}
      preventClose={uploadWidgetOpen}
      contentClassName="sm:max-w-106.25"
      trigger={
        <Button
          ref={triggerRef}
          variant={buttonVariant}
          className={`col-auto ${className || ""}`}
        >
          {children ? children : t("create.title")}
        </Button>
      }
    >
      <CreatePlannedDialog
        onCompleted={() => setOpen(false)}
        onUploadWidgetOpenChange={setUploadWidgetOpen}
      />
    </ResponsiveDialogDrawer>
  );
}
