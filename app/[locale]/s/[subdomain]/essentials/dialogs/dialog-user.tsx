import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";

function UserDialog() {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <Avatar></Avatar>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Convidar</Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default UserDialog;
