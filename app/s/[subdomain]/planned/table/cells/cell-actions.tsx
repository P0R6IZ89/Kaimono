"use client";

import React, { useEffect, useState, useTransition } from "react";
import { RowCellProps } from "./cell-profile";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Pencil, Trash2, Undo } from "lucide-react";
import { completeTask, deleteTask, revertTask } from "@/actions/plannedActions";
import { toast } from "sonner";

type ActionState = {
  error?: string;
  message?: { isSuccess: boolean };
};

function ActionsCell({ row }: RowCellProps) {
  const { status, id } = row.original;
  const [state, setState] = useState<ActionState>({});
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (state.message?.isSuccess) {
      toast.success("Ação bem-sucedida");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error, state.message?.isSuccess]);

  return (
    <div className="flex flex-row gap-2 px-4 pt-4">
      {!isPending ? (
        <Button
          variant={"default"}
          className="flex-1"
          onClick={() => {
            if (status === "pending") {
              startTransition(async () => {
                await completeTask(id);
              });
            } else if (status === "complete") {
              startTransition(async () => {
                await revertTask(id);
              });
            }
          }}
        >
          {status === "pending" ? (
            <>
              <span>Marcar como completo</span>
              <Check className="text-green-700" />
            </>
          ) : null}
          {status === "complete" ? (
            <>
              <span>Reverter para pendente</span>
              <Undo />
            </>
          ) : null}
        </Button>
      ) : (
        <Button className="flex-1">
          <Loader2 className="animate-spin" />
        </Button>
      )}
      <Button
        variant={"outline"}
        onClick={() => {
          startTransition(async () => {
            const result = await deleteTask(id);
            setState(result);
          });
        }}
      >
        <Trash2 className="text-destructive" />
      </Button>
      <Button variant={"outline"}>
        <Pencil />
      </Button>
    </div>
  );
}

export default ActionsCell;
