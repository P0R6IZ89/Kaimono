import React from "react";
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

function InfoDialog({ row, open, setOpen }: CustomDialogProps) {
  const { title } = row.original;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit the {title}</DialogTitle>
          <DialogDescription>
            Depois de editar o item, não se esqueça de clicar em salvar!
          </DialogDescription>
        </DialogHeader>
        <div>FORM HERE</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Voltar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit">Salvar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InfoDialog;
