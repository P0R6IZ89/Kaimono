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
import { useToast } from "@/hooks/use-toast";
import { updateStatusEssentials } from "@/actions/essentialsActions";

interface StateType {
  status: "success" | "error";
  message: string;
}

function PendingDialog({ row, open, setOpen }: CustomDialogProps) {
  const { toast } = useToast();
  const { id } = row.original;
  const [state, action, isPending] = useActionState<StateType | null>(
    (prevState: unknown) =>
      updateStatusEssentials(prevState, id, "pending").then((result) => result),
    null
  );

  useEffect(() => {
    if (state) {
      if (state.status === "success") {
        toast({
          title: "Sucesso!",
          description: state.message,
          variant: "default",
        });
      } else if (state.status === "error") {
        toast({
          title: "Error",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);

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
              Reverter para Pendente
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PendingDialog;
