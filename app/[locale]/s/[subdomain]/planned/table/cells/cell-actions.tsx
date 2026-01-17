"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, Undo } from "lucide-react";
import { completeTask, revertTask } from "@/actions/plannedActions";
import { toast } from "sonner";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { useTranslations } from "next-intl";
import { ActionResult, initialState } from "@/util/initial-action-return";
import CommentsDrawer from "./comment-drawer";
import ActionsButton from "./actions-buttons";

function ActionsCell({ row }: { row: Row<PlannedSchema> }) {
  const t = useTranslations("PlannedPage");

  const { status, id, comments, commentsCount } = row.original;
  const [state, setState] = useState<ActionResult>(initialState);
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message || t("action-success"));
    } else {
      toast.error(state.message || t("action-failed"));
    }
  }, [state, t]);

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
                const message =
                  result.message ??
                  (result.ok ? t("action-success") : t("action-failed"));
                setState({
                  ok: result.ok,
                  message,
                });
              });
            }}
          >
            <Check className="text-green-700" />
            <span>{t("mark-as-purchased")}</span>
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
              const message =
                result.message ??
                (result.ok ? t("action-success") : t("action-failed"));
              setState({ ok: result.ok, message });
            });
          }}
        >
          <Undo className="text-muted-foreground" />
          <span>{t("revert-to-pending")}</span>
        </Button>
      )}
      <CommentsDrawer
        id={id}
        comments={comments}
        commentsCount={commentsCount}
      />
      <ActionsButton row={row} />
    </div>
  );
}

export default ActionsCell;
