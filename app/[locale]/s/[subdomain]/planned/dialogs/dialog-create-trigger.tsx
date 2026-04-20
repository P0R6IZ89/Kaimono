"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CreatePlannedDialog,
  type PlannedImageSelection,
} from "./dialog-create";
import { useTranslations } from "next-intl";
import { ResponsiveDialogDrawer } from "@/components/dialog/responsive-dialog-drawer";

export function CreatePlannedDialogTrigger({
  className,
  buttonVariant = "default",
  children,
  triggerRef,
  mode = "standalone",
  projectId,
  trigger,
  contentClassName,
  showAutoCreate = true,
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
  mode?: "standalone" | "project";
  projectId?: string;
  trigger?: React.ReactNode;
  contentClassName?: string;
  showAutoCreate?: boolean;
}) {
  const t = useTranslations("Planned");
  const [open, setOpen] = useState(false);
  const [uploadWidgetOpen, setUploadWidgetOpen] = useState(false);
  const [imageSelection, setImageSelection] = useState<
    PlannedImageSelection | undefined
  >(undefined);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (!isOpen) {
      setUploadWidgetOpen(false);
      setImageSelection(undefined);
    }
  };

  return (
    <ResponsiveDialogDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title={t("create.title")}
      // description={t("create.description")}
      preventClose={uploadWidgetOpen}
      contentClassName={contentClassName ?? "sm:max-w-106.25"}
      trigger={
        trigger ?? (
          <Button
            ref={triggerRef}
            variant={buttonVariant}
            className={`col-auto ${className || ""}`}
          >
            {children ? children : t("create.title")}
          </Button>
        )
      }
    >
      <CreatePlannedDialog
        mode={mode}
        projectId={projectId}
        showAutoCreate={showAutoCreate}
        imageSelection={imageSelection}
        onImageSelectionChange={setImageSelection}
        onCompleted={() => {
          setUploadWidgetOpen(false);
          setImageSelection(undefined);
          setOpen(false);
        }}
        onUploadWidgetOpenChange={setUploadWidgetOpen}
      />
    </ResponsiveDialogDrawer>
  );
}
