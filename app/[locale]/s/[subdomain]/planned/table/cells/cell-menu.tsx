import React, { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Menu, Trash } from "lucide-react";
import { ConfirmMenuItem } from "@/components/dialog/confirmMenuItem";
import { toast } from "sonner";
import { completeTask, deleteTask, revertTask } from "@/actions/plannedActions";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { ActionResult } from "@/util/initial-action-return";

function MenuCell(row: Row<PlannedSchema>) {
  const { status, id } = row.original;

  const [isPending, startTransition] = useTransition();

  const wrapAction = (
    action: (id: string) => Promise<ActionResult>,
    successText: string
  ) => {
    startTransition(async () => {
      try {
        const res = await action(id);

        if (!res.ok) {
          toast.error(res.message ?? "Operação não finalizada com sucesso");
          return;
        }

        toast.success(res.message ?? successText);
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(err.message ?? "Algo deu errado");
        } else {
          toast.error("Algo deu errado");
        }
      }
    });
  };

  return (
    <div className="dark absolute top-4 right-4 z-10 text-foreground bg-purple-400">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-full size-9 backdrop-blur-sm"
            variant={"outline"}
          >
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status === "PENDING" ? (
            <ConfirmMenuItem
              title="Completar"
              description="Deseja marcar como completo?"
              onConfirm={() =>
                wrapAction(completeTask, "Item marcado como completo")
              }
              icon={<CheckCircle className="text-confirm" />}
              isPending={isPending}
            />
          ) : (
            <ConfirmMenuItem
              title="Reverter"
              description="Deseja reverter o status?"
              onConfirm={() =>
                wrapAction(revertTask, "Item marcado como completo")
              }
              icon={<Clock className="text-orange-400" />}
              isPending={isPending}
            />
          )}
          <ConfirmMenuItem
            title="Deletar"
            description="Deseja deletar o item? Esta ação não pode ser desfeita."
            onConfirm={() => wrapAction(deleteTask, "Item deletado")}
            icon={<Trash className="text-destructive" />}
            isPending={isPending}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default MenuCell;
