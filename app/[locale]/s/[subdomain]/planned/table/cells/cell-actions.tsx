"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Banknote, Check, Trash2, Undo } from "lucide-react";
import {
  completeTask,
  deleteTask,
  markSaveMoney,
  revertTask,
} from "@/actions/plannedActions";
import { toast } from "sonner";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { useTranslations } from "next-intl";
import { EditPlannedDialog } from "../../dialogs/dialog-edit";

type ActionState = {
  error?: string;
  message?: { isSuccess: boolean };
};

function ActionsCell({ row }: { row: Row<PlannedSchema> }) {
  const t = useTranslations("PlannedPage");
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
      {status === "PENDING" ? (
        <>
          <Button
            variant={"outline"}
            className="flex-1"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await completeTask(id);
                setState(result);
              });
            }}
          >
            <Check className="text-green-700" />
            <span>{t("mark-as-purchased")}</span>
          </Button>
          <Button
            variant={"outline"}
            className="flex-1"
            disabled={true}
            onClick={() => {
              startTransition(async () => {
                const result = await markSaveMoney(id, true);
                setState(result);
              });
            }}
          >
            <Banknote className="text-green-700" />
            <span>{t("save-money")}</span>
          </Button>
        </>
      ) : (
        <Button
          variant={"outline"}
          className="flex-1"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await revertTask(id);
              setState(result);
            });
          }}
        >
          <Undo />
          <span>{t("revert-to-pending")}</span>
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

      <EditPlannedDialog row={row} />
    </div>
  );
}

export default ActionsCell;
