import React, { Dispatch, SetStateAction } from "react";
import { Row } from "@tanstack/react-table";
import { TableRowData } from "../table/essentials-columns";
import PendingDialog from "./dialog-custom/dialog-pending";
import CompleteDialog from "./dialog-custom/dialog-complete";
import InfoDialog from "./dialog-custom/dialog-info";
import DeleteDialog from "./dialog-custom/dialog-delete";

interface ActionDialiogProps {
  row: Row<TableRowData>;
  dialogType: "info" | "complete" | "pending" | "delete";
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
      case "info":
        return <InfoDialog row={row} open={open} setOpen={setOpen} />;
      case "complete":
        return <CompleteDialog row={row} open={open} setOpen={setOpen} />;
      case "pending":
        return <PendingDialog row={row} open={open} setOpen={setOpen} />;
      case "delete":
        return <DeleteDialog row={row} open={open} setOpen={setOpen} />;
    }
  };
  return <>{renderDialog()}</>;
}

export default ActionDialogV2;
