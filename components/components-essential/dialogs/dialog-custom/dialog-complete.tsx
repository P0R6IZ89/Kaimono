import React, { startTransition, useActionState, useEffect } from "react";
import { CustomDialogProps } from "../action-dialogv2";
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
import { updateStatusEssentials } from "@/actions/actions";
import { useToast } from "@/hooks/use-toast";

function CompleteDialog({ row, open, setOpen }: CustomDialogProps) {
  const { toast } = useToast();

  interface StateType {
    status: "success" | "error";
    message: string;
  }

  const [state, action, isPending] = useActionState<StateType | null>(
    (prevState: unknown) =>
      updateStatusEssentials(prevState, row, "complete").then(
        (result) => result
      ),
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
              Marcar como Completo
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CompleteDialog;
