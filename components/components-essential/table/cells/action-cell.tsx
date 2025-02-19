import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CircleCheckBig,
  Clock,
  Info,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { useState } from "react";
import ActionDialog from "@/components/components-essential/dialogs/alert-dialog";
import { Row } from "@tanstack/react-table";
import { TableRowData } from "../essentials-columns";
import { deleteEssentials, updateStatusEssentials } from "@/actions/actions";
import ActionDialogV2 from "@/components/components-essential/dialogs/action-dialogv2";

interface ActionDialogProps {
  row: Row<TableRowData>;
}

function ActionCell({ row }: ActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [actionType, setActiontype] = useState<
    "delete" | "complete" | "info" | "pending" | null
  >(null);
  const handleActionClick = (
    type: "delete" | "complete" | "info" | "pending"
  ) => {
    setActiontype(type);
    setOpen(true);
  };

  const status = row.original.status;

  // async function handleConfirm() {
  //   if (actionType == "delete") {
  //     deleteEssentials(id);
  //   } else if (actionType === "complete" || actionType === "pending") {
  //     updateStatusEssentials(id, actionType);
  //   }
  //   setOpen(false);
  // }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal size={16} strokeWidth={1} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleActionClick("info")}>
          <Info />
          Mais sobre...
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleActionClick("delete")}>
          <Trash className="text-destructive" />
          Deletar
        </DropdownMenuItem>
        {status === "pending" ? (
          <DropdownMenuItem onSelect={() => handleActionClick("complete")}>
            <CircleCheckBig className="text-green-700" />
            Completo
          </DropdownMenuItem>
        ) : status === "complete" ? (
          <DropdownMenuItem onSelect={() => handleActionClick("pending")}>
            <Clock className="text-orange-700" />
            Pendente
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
      {actionType && (
        <>
          {/* <ActionDialog
            id={id}
            row={row}
            dialogVariant={actionType}
            open={open}
            setOpen={setOpen}
            itemTitle={title}
            onConfirm={handleConfirm}
          /> */}
          <ActionDialogV2
            row={row}
            dialogType={actionType}
            open={open}
            setOpen={setOpen}
          />
        </>
      )}
    </DropdownMenu>
  );
}

export default ActionCell;
