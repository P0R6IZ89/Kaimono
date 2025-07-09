import { logoutAction } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";

function DialogLogout() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Deseja fazer logout?</DialogTitle>
      </DialogHeader>
      <DialogFooter className="sm:justify-start">
        <form action={logoutAction}>
          <Button type="submit">Logout</Button>
        </form>
        <DialogClose asChild>
          <Button type="button" variant={"secondary"}>
            Cancelar
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

export default DialogLogout;
