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
import ActionDialogV2 from "../../dialogs/action-dialogv2";
import { useTranslations } from "next-intl";

interface ActionDialogProps {
  row: Row<TableRowData>;
}

type StatusType = "PENDING" | "PURCHASED" | "CANCELLED";

function ActionCell({ row }: ActionDialogProps) {
  const t = useTranslations("Table");
  const [open, setOpen] = useState(false);
  const [actionType, setActiontype] = useState<
    "edit" | "delete" | "mark-as-purchased" | "mark-as-pending"
  >();
  const handleActionClick = (
    type: "edit" | "delete" | "mark-as-purchased" | "mark-as-pending"
  ) => {
    setActiontype(type);
    setOpen(true);
  };

  const status: StatusType = row.original.status as StatusType;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal size={16} strokeWidth={1} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleActionClick("edit")}>
          <Info />
          {t("edit-item")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleActionClick("delete")}>
          <Trash className="text-destructive" />
          {t("delete-item")}
        </DropdownMenuItem>
        {status === "PENDING" ? (
          <DropdownMenuItem
            onSelect={() => handleActionClick("mark-as-purchased")}
          >
            <CircleCheckBig className="text-green-400" />
            {t("mark-as-purchased")}
          </DropdownMenuItem>
        ) : status === "PURCHASED" ? (
          <DropdownMenuItem
            onSelect={() => handleActionClick("mark-as-pending")}
          >
            <Clock className="text-orange-400" />
            {t("mark-as-pending")}
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
