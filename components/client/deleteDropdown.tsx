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

function DeleteDropdown({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        const result = await deleteApp(id);
        if (result?.message?.isSuccess) {
          toast.success("O app foi excluido com suscesso!");
        }
      } catch (error) {
        toast.error(`Algo deu errado: ${error}`);
      }
    });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Ellipsis className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ConfirmMenuItem
          title="Deletar"
          description="Deseja realmente deletar o app?"
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
