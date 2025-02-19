import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { dialog_messages } from "@/data/data";
import { Button } from "../../ui/button";
import EditDialog from "./edit-dialog";
import { Row } from "@tanstack/react-table";
import { TableRowData } from "../table/essentials-columns";

interface ActionDialiogProps {
  id?: string;
  row: Row<TableRowData>;
  open: boolean;
  setOpen: (open: boolean) => void;
  dialogVariant: "delete" | "complete" | "info" | "pending";
  itemTitle: string;
  onConfirm?: () => void;
}

function ActionDialog({
  id,
  row,
  open,
  setOpen,
  dialogVariant,
  itemTitle,
  onConfirm,
}: ActionDialiogProps) {
  const message = dialog_messages[dialogVariant];
  const title = itemTitle
    ? message.title.replace("{title}", itemTitle)
    : message.title;

  const handleAction = () => {
    if (onConfirm) {
      onConfirm();
    }
    setOpen(false);
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message.description}</AlertDialogDescription>
          {dialogVariant === "info" && id != undefined && (
            <EditDialog id={id} row={row} />
          )}
        </AlertDialogHeader>
        {dialogVariant === "info" ? null : (
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleAction}
                variant={dialogVariant == "delete" ? "destructive" : "default"}
              >
                {message.action}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ActionDialog;
