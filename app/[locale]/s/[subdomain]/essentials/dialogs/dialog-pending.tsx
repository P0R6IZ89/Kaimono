import React, { useActionState, useEffect } from "react";
import { CustomDialogProps } from "./action-dialogv2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateStatusEssentials } from "@/actions/essentialsActions";
import { toast } from "sonner";
import { initialState } from "@/util/initial-action-return";
import { useTranslations } from "next-intl";

function PendingDialog({ row, open, setOpen }: CustomDialogProps) {
  const t = useTranslations("Dialog");
  const { id } = row.original;
  const [state, action, isPending] = useActionState(
    updateStatusEssentials,
    initialState
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("mark-as-pending-title")}</DialogTitle>
          <DialogDescription>
            {t("mark-as-pending-description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>{t("close")}</Button>
          </DialogClose>
          <form action={action}>
            <input defaultValue={id} type="hidden" name="id" />
            <input defaultValue="PENDING" type="hidden" name="status" />
            <Button type="submit" disabled={isPending}>
              {t("mark-as-pending-confirm-button")}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PendingDialog;
