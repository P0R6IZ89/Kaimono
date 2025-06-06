"use client";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { signOut } from "next-auth/react";

function DialogLogout() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Deseja fazer logout?</DialogTitle>
      </DialogHeader>
      <DialogFooter className="sm:justify-start">
        <Button onClick={() => signOut()}>Logout</Button>
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
