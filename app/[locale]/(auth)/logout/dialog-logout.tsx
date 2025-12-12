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
import { signOutAction } from "@/actions/authActions";

interface DialogLogoutProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DialogLogout({ open, onOpenChange }: DialogLogoutProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Deseja fazer logout?</DialogTitle>
      </DialogHeader>
      <DialogFooter className="sm:justify-start">
        <Button
          onClick={async () => {
            const result = await signOutAction();
            onOpenChange?.(false);
            if (result.ok) {
              window.location.reload();
            }
          }}
        >
          Logout
        </Button>
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
