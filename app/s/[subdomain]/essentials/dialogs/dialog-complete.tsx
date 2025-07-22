import React, { startTransition, useActionState, useEffect } from "react";
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

interface StateType {
  status: "success" | "error";
  message: string;
}

function CompleteDialog({ row, open, setOpen }: CustomDialogProps) {
  const { id } = row.original;

  const [state, action, isPending] = useActionState<StateType | null>(
    (prevState: unknown) =>
      updateStatusEssentials(prevState, id, "complete").then(
        (result) => result
      ),
    null
  );

  useEffect(() => {
    if (state) {
      if (state.status === "success") {
        toast.success(`Sucesso! ${state.message}`);
      } else if (state.status === "error") {
        toast.error(`Erro! ${state.message}`);
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
            <Button
              type="submit"
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  action();
                });
              }}
            >
              <CircleCheckBig /> Marcar como completo
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CompleteDialog;
