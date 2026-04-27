"use client";
import React, { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Ellipsis, Trash2 } from "lucide-react";
import { deleteApp } from "@/actions/appActions";
import { toast } from "sonner";
import { ConfirmMenuItem } from "../dialog/confirmMenuItem";
import { useTranslations } from "next-intl";
import { translateMessage } from "@/lib/translate-message";

function DeleteDropdown({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Common");
  const tActions = useTranslations("ActionMessages");

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        const result = await deleteApp(id);
        if (result.ok) {
          toast.success(translateMessage(tActions, result.message));
        }
        if (!result.ok) {
          toast.error(translateMessage(tActions, result.message));
        }
      } catch (error) {
        toast.error(
          tActions("unexpectedWithError", { error: String(error) }),
        );
      }
    });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 border border-muted rounded-md hover:bg-accent/50 transition-colors">
        <Ellipsis className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ConfirmMenuItem
          title={t("actions.delete")}
          description={tActions("confirmDeleteApp")}
          icon={<Trash2 />}
          isPending={isPending}
          onConfirm={() => handleDelete(id)}
          variant={"destructive"}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DeleteDropdown;
