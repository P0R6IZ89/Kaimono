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

export function CreatePlannedDialogTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Adicionar novo item</DialogTitle>
          <DialogDescription>
            Adicione novo item na lista de essenciais.
          </DialogDescription>
        </DialogHeader>
        <CreatePlannedDialog />
      </DialogContent>
    </Dialog>
  );
}
