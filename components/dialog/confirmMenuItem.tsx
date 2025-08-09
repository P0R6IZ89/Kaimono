// components/ConfirmMenuItem.tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";

interface ConfirmMenuItemProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  icon?: React.ReactNode;
  isPending?: boolean;
  variant?: "default" | "destructive";
}

export function ConfirmMenuItem({
  title,
  description = "Are you sure?",
  onConfirm,
  icon,
  isPending = false,
  variant = "default",
}: ConfirmMenuItemProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await onConfirm(); // await the API call
      setOpen(false); // then close the dialog
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onSelect={(e) => e.preventDefault()} asChild>
        <DropdownMenuItem>
          {icon}
          <span>{title}</span>
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{description}</DialogTitle>
        </DialogHeader>
        <DialogFooter className="space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant={variant}
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? <Loader2 className="animate-spin" /> : icon}
            <span>{title}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
