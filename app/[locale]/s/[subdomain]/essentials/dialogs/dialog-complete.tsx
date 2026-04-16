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
import { initialState } from "@/lib/initial-action-return";
import { useTranslations } from "next-intl";
import { useSubdomain } from "@/context/SubdomainContext";

function CompleteDialog({ row, open, setOpen }: CustomDialogProps) {
  const { subdomain } = useSubdomain();
  const t = useTranslations("Dialog");
  const { id, title } = row.original;

  const [state, action, isPending] = useActionState(
    updateStatusEssentials,
    initialState,
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
          <DialogTitle>{t("mark-as-purchased-title", { title })}</DialogTitle>
          <DialogDescription>
            {t("mark-as-purchased-description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>{t("close")}</Button>
          </DialogClose>
          <form action={action}>
            <input type="hidden" name="subdomain" defaultValue={subdomain} />
            <input type="hidden" name="id" defaultValue={id} />
            <input type="hidden" name="status" defaultValue="PURCHASED" />
            <Button type="submit" disabled={isPending}>
              {t("mark-as-purchased-confirm-button")}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CompleteDialog;
