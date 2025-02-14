import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleCheckBig, Info, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import ActionDialog from "@/components/alert-dialog/alert-dialog";
import { Row } from "@tanstack/react-table";
import { TableRowData } from "../essentials-columns";

interface ActionDialogProps {
  row: Row<TableRowData>;
}

function ActionCell({ row }: ActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [actionType, setActiontype] = useState<
    "delete" | "complete" | "info" | null
  >(null);
  const handleActionClick = (type: "delete" | "complete" | "info") => {
    setActiontype(type);
    setOpen(true);
  };

  const title = row.original.title;
  const id = row.original.id;
  if (!title || !id) return null;

  const handleConfirm = () => {};
  // Stopped Here!!!

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
        <DropdownMenuItem onSelect={() => handleActionClick("complete")}>
          <CircleCheckBig className="text-green-700" />
          Completo
        </DropdownMenuItem>
      </DropdownMenuContent>
      {actionType && (
        <ActionDialog
          id={id}
          row={row}
          dialogVariant={actionType}
          open={open}
          setOpen={setOpen}
          itemTitle={title}
          onConfirm={handleConfirm}
        />
      )}
    </DropdownMenu>
  );
}

export default ActionCell;
