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
import { Row } from "@tanstack/react-table";
import { TableRowData } from "../essentials-columns";
import ActionDialogV2 from "@/app/s/[subdomain]/essentials/dialogs/action-dialogv2";

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
            <Clock />
            Pendente
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
      {actionType && (
        <>
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
