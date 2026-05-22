"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type ResponsiveDialogDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
  bodyClassName?: string;
  preventClose?: boolean;
  modal?: boolean;
};

export function ResponsiveDialogDrawer({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  children,
  contentClassName,
  bodyClassName,
  preventClose = false,
  modal = false,
}: ResponsiveDialogDrawerProps) {
  const isMobile = useIsMobile();

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (preventClose && !nextOpen) return;
      onOpenChange(nextOpen);
    },
    [onOpenChange, preventClose],
  );

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={handleOpenChange}
        dismissible={!preventClose}
        modal={modal}
      >
        {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
        <DrawerContent className={cn("pb-6", contentClassName)}>
          <div className="w-full max-h-[95vh] overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              {description ? (
                <DrawerDescription>{description}</DrawerDescription>
              ) : null}
            </DrawerHeader>
            <div className={cn("px-4 pb-4", bodyClassName)}>{children}</div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={modal}>
      {open && <div className="fixed inset-0 w-dvw h-dvh z-10 bg-black/50 " />}
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto min-w-160",
          contentClassName,
        )}
        onInteractOutside={(event) => {
          if (preventClose) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (preventClose) event.preventDefault();
        }}
        onFocusOutside={(event) => {
          if (preventClose) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className={bodyClassName}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
