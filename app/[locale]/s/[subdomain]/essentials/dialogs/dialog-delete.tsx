import React, { startTransition, useActionState, useEffect } from "react";
import { CustomDialogProps } from "./action-dialogv2";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteEssentials } from "@/actions/essentialsActions";
import { useSubdomain } from "@/context/SubdomainContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { translateMessage } from "@/lib/translate-message";

function DeleteDialog({ row, open, setOpen }: CustomDialogProps) {
  const t = useTranslations("Dialog");
  const tActions = useTranslations("ActionMessages");
  const { id, title } = row.original;
  const { subdomain } = useSubdomain();

  interface StateType {
    status: "success" | "error";
    message: string;
  }
  const [state, action, isPending] = useActionState<StateType | null>(
    (prevState: unknown) =>
      deleteEssentials(prevState, id, subdomain).then((result) => result),
    null
  );
  useEffect(() => {
    if (state) {
      if (state.status === "success") {
        toast.success(translateMessage(tActions, state.message));
      } else if (state.status === "error") {
        toast.error(translateMessage(tActions, state.message));
      }
    }
  }, [state, tActions]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("delete-title", { title })}</DialogTitle>
          <DialogDescription>{t("delete-description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>{t("close")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant={"destructive"}
              type="submit"
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  action();
                });
              }}
            >
              {t("delete-confirm-button")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteDialog;
