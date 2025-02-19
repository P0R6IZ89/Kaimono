import React, { startTransition, useActionState, useEffect } from "react";
import { CustomDialogProps } from "../action-dialogv2";
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
import { deleteEssentials } from "@/actions/actions";
import { useToast } from "@/hooks/use-toast";

function DeleteDialog({ row, open, setOpen }: CustomDialogProps) {
  const { toast } = useToast();

  interface StateType {
    status: "success" | "error";
    message: string;
  }
  const { title } = row.original;
  const [state, action, isPending] = useActionState<StateType | null>(
    (prevState: unknown) =>
      deleteEssentials(prevState, row).then((result) => result),
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
          <DialogTitle>Você realmente deseja deletar o {title}?</DialogTitle>
          <DialogDescription>
            Essa ação não pode ser revertida. O item selecionado será excluído
            do banco de dados.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Voltar</Button>
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
              Deletar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteDialog;
