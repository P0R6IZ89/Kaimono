"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, Undo } from "lucide-react";
import { completeTask, revertTask } from "@/actions/plannedActions";
import { toast } from "sonner";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { useTranslations } from "next-intl";
import { ActionResult, initialState } from "@/lib/initial-action-return";
import CommentsDrawer from "./comment-drawer";
import ActionsButton from "./actions-buttons";

function ActionsCell({ row }: { row: Row<PlannedSchema> }) {
  const t = useTranslations("Planned");

  const { status, id, comments, commentsCount } = row.original;
  const [state, setState] = useState<ActionResult>(initialState);
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message || t("feedback.actionSuccess"));
    } else {
      toast.error(state.message || t("feedback.actionFailed"));
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
                  (result.ok
                    ? t("feedback.actionSuccess")
                    : t("feedback.actionFailed"));
                setState({
                  ok: result.ok,
                  message,
                });
              });
            }}
          >
            <Check className="text-green-700" />
            <span>{t("actions.markAsPurchased")}</span>
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
                (result.ok
                  ? t("feedback.actionSuccess")
                  : t("feedback.actionFailed"));
              setState({ ok: result.ok, message });
            });
          }}
        >
          <Undo className="text-muted-foreground" />
          <span>{t("actions.revertToPending")}</span>
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
