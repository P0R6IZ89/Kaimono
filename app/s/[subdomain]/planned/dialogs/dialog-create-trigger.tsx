import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreatePlannedDialog } from "./dialog-create";

export function CreatePlannedDialogTrigger() {
  return (
    <div className="space-y-8">
      <Dialog modal={false}>
        <DialogTrigger asChild>
          <Button className="h-8 px-2 lg:px-3">
            <Plus />
            <span>Adicionar</span>
          </Button>
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Adicionar novo item</DialogTitle>
            <DialogDescription>
              Adicione novo item na lista de essenciais.
            </DialogDescription>
          </DialogHeader>
          <CreatePlannedDialog />
        </DialogContent>
      </Dialog>
    </div>
  );
}
