import { deleteTask } from "@/actions/plannedActions";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionResult, initialState } from "@/util/initial-action-return";
import { Row } from "@tanstack/react-table";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { EditPlannedDialog } from "../../dialogs/dialog-edit";
import { ConfirmDialog } from "@/components/dialog/confirmMenuItem";

export default function ActionsButton({ row }: { row: Row<PlannedSchema> }) {
  const { id } = row.original;
  const t = useTranslations("PlannedPage");
  const [state, setState] = useState<ActionResult>(initialState);
  const [isPending, startTransition] = useTransition();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const onConfirmDelete = useCallback(() => {
    startTransition(async () => {
      const result = await deleteTask(id);
      const message =
        result.message ??
        (result.ok ? t("action-success") : t("action-failed"));
      setState({ ok: result.ok, message });
    });
  }, [id, t]);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message || t("action-success"));
    } else {
      toast.error(state.message || t("action-failed"));
    }
  }, [state, t]);
  return (
    <>
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top">
          <DropdownMenuItem
            onSelect={() => {
              setDropdownOpen(false);
              setConfirmDialogOpen(true);
            }}
          >
            <Trash2 className="text-destructive" />
            <span>Delete</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setDropdownOpen(false);
              setDialogOpen(true);
            }}
          >
            <Pencil />
            <span>Edit</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        title="Delete"
        description="Are you sure you want to delete?"
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={onConfirmDelete}
        icon={<Trash2 className="text-destructive" />}
        isPending={isPending}
        variant="destructive"
      />
      <EditPlannedDialog
        row={row}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
