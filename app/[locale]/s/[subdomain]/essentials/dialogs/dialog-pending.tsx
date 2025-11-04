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

function PendingDialog({ row, open, setOpen }: CustomDialogProps) {
  const { id, status } = row.original;
  const [state, action, isPending] = useActionState(
    updateStatusEssentials,
    initialState
  );

  useEffect(() => {
    if (state) {
      if (!state.ok) {
        toast.error(state.message);
      } else if (state.ok) {
        toast.success(state.message);
      }
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deseja marcar como Pendente?</DialogTitle>
          <DialogDescription>
            O item selecionado será revertido para o estado de pendente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <form action={action}>
            <DialogClose asChild>
              <Button variant={"outline"}>Voltar</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="submit"
                disabled={isPending}
                // onClick={() => {
                //   startTransition(() => {
                //     action();
                //   });
                // }}
              >
                Reverter para Pendente
              </Button>
            </DialogClose>
            <input value={id} type="id" />
            <input value={status} type="hidden" name="status" />
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PendingDialog;
