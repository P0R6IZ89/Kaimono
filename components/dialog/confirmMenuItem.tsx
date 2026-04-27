import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

type ConfirmDialogProps = {
  title: string;
  description?: string;
  onConfirm: () => void;
  icon?: ReactNode;
  isPending?: boolean;
  variant?: "default" | "destructive";
};

function ConfirmDialogContent({
  title,
  description = "Are you sure?",
  onConfirm,
  icon,
  isPending = false,
  variant = "default",
}: ConfirmDialogProps) {
  const t = useTranslations("Common");
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{description}</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogFooter className="space-x-2">
        <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button variant={variant} disabled={isPending} onClick={onConfirm}>
            {isPending ? <Loader2 className="animate-spin" /> : icon}
            <span>{title}</span>
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  ...props
}: ConfirmDialogProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <ConfirmDialogContent {...props} />
    </AlertDialog>
  );
}

export function ConfirmMenuItem({
  title,
  description,
  onConfirm,
  icon,
  isPending = false,
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          variant={variant}
          disabled={isPending}
          onSelect={(event) => event.preventDefault()}
        >
          {icon ? icon : null}
          <span>{title}</span>
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <ConfirmDialogContent
        title={title}
        description={description}
        onConfirm={onConfirm}
        icon={icon}
        isPending={isPending}
        variant={variant}
      />
    </AlertDialog>
  );
}
