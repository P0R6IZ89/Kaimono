"use client";

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
import { ActionResult } from "@/lib/initial-action-return";
import { useTranslations } from "next-intl";
import { translateMessage } from "@/lib/translate-message";

function MenuCell(row: Row<PlannedSchema>) {
  const { status, id } = row.original;
  const t = useTranslations("Planned");
  const tActions = useTranslations("ActionMessages");

  const [isPending, startTransition] = useTransition();

  const wrapAction = (
    action: (id: string) => Promise<ActionResult>,
    successText: string,
  ) => {
    startTransition(async () => {
      try {
        const res = await action(id);

        if (!res.ok) {
          toast.error(
            translateMessage(tActions, res.message) ??
              t("feedback.actionFailed"),
          );
          return;
        }

        toast.success(
          translateMessage(tActions, res.message) ?? successText,
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(err.message ?? t("feedback.actionFailed"));
        } else {
          toast.error(t("feedback.actionFailed"));
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
              title={t("actions.markAsPurchased")}
              description={t("actions.markAsPurchasedDescription")}
              onConfirm={() =>
                wrapAction(completeTask, t("feedback.actionSuccess"))
              }
              icon={<CheckCircle className="text-confirm" />}
              isPending={isPending}
            />
          ) : (
            <ConfirmMenuItem
              title={t("actions.revertToPending")}
              description={t("actions.revertToPendingDescription")}
              onConfirm={() =>
                wrapAction(revertTask, t("feedback.actionSuccess"))
              }
              icon={<Clock className="text-orange-400" />}
              isPending={isPending}
            />
          )}
          <ConfirmMenuItem
            title={t("actions.deleteConfirmTitle")}
            description={t("actions.deleteConfirmDescription")}
            onConfirm={() => wrapAction(deleteTask, t("feedback.actionSuccess"))}
            icon={<Trash className="text-destructive" />}
            isPending={isPending}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default MenuCell;
