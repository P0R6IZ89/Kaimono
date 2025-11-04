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
import { CircleCheckBig } from "lucide-react";
import { updateStatusEssentials } from "@/actions/essentialsActions";
import { toast } from "sonner";
import { initialState } from "@/util/initial-action-return";

function CompleteDialog({ row, open, setOpen }: CustomDialogProps) {
  const { id } = row.original;

  const [state, action, isPending] = useActionState(
    updateStatusEssentials,
    initialState
  );

  useEffect(() => {
    if (state) {
      if (state.ok) {
        toast.success(state.message);
      } else if (!state.ok) {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deseja marcar como Completo?</DialogTitle>
          <DialogDescription>
            O item selecionado será marcado como completo.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Voltar</Button>
          </DialogClose>
          <DialogClose asChild>
            <form action={action}>
              <input value={id} type="id" />
              <Button type="submit" disabled={isPending}>
                <CircleCheckBig /> Marcar como completo
              </Button>
            </form>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CompleteDialog;
