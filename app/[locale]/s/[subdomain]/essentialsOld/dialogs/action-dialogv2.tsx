import React, { Dispatch, SetStateAction } from "react";
import { Row } from "@tanstack/react-table";
import { TableRowData } from "../table/essentials-columns";
import PendingDialog from "./dialog-pending";
import CompleteDialog from "./dialog-complete";
import DeleteDialog from "./dialog-delete";
import EditDialog from "./dialog-edit";

interface ActionDialiogProps {
  row: Row<TableRowData>;
  dialogType: "edit" | "delete" | "mark-as-purchased" | "mark-as-pending";
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface CustomDialogProps {
  row: Row<TableRowData>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

function ActionDialogV2({
  row,
  dialogType,
  open,
  setOpen,
}: ActionDialiogProps) {
  const renderDialog = () => {
    switch (dialogType) {
      case "edit":
        return <EditDialog row={row} open={open} setOpen={setOpen} />;
      case "delete":
        return <DeleteDialog row={row} open={open} setOpen={setOpen} />;
      case "mark-as-purchased":
        return <CompleteDialog row={row} open={open} setOpen={setOpen} />;
      case "mark-as-pending":
        return <PendingDialog row={row} open={open} setOpen={setOpen} />;
    }
  };
  return <>{renderDialog()}</>;
}

export default ActionDialogV2;
