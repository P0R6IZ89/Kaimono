"use client";

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
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { type ReactNode } from "react";

type ProjectCardPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  preventClose?: boolean;
};

export function ProjectCardPanel({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  contentClassName,
  preventClose = false,
}: ProjectCardPanelProps) {
  const isMobile = useIsMobile();

  const handleOpenChange = (nextOpen: boolean) => {
    if (preventClose && !nextOpen) return;
    onOpenChange(nextOpen);
  };

  if (isMobile) {
    return (
      <Drawer
        open={open}
        dismissible={!preventClose}
        onOpenChange={handleOpenChange}
        modal={false}
      >
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="mx-auto pb-6 md:w-2xl">
          <div className="mx-auto max-h-[80vh] w-full overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              {description ? (
                <DrawerDescription>{description}</DrawerDescription>
              ) : null}
            </DrawerHeader>
            <div className={cn("px-4 pb-4", contentClassName)}>{children}</div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={contentClassName}
        onEscapeKeyDown={(event) => {
          if (preventClose) event.preventDefault();
        }}
        onFocusOutside={(event) => {
          if (preventClose) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (preventClose) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (preventClose) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
