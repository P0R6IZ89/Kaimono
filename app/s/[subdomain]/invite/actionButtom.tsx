"use client";
import React, { useMemo, useState, useTransition } from "react";
import { ConfirmMenuItem } from "@/components/dialog/confirmMenuItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvitationStatus as StatusEnum } from "@prisma/client";
import { RefreshCwIcon, UserMinus, Ellipsis, Trash } from "lucide-react";

import {
  resendInviteAction,
  revokeInviteAction,
} from "@/actions/invitationActions";
import { toast } from "sonner";
import { removeMemberAction } from "@/actions/appActions";

type ActionConfig = {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isPending: boolean;
  onConfirm: () => Promise<void> | void;
};

const makeRevokeAction = (status: StatusEnum, id: string): ActionConfig => ({
  key: "revoke",
  title: "Revogar Convite",
  description:
    status === StatusEnum.PENDING
      ? "Este convite ainda está pendente. Deseja revogá-lo?"
      : "Este convite já expirou. Revogar permanentemente?",
  icon: <Trash size={16} />,
  isPending: false,
  onConfirm: async () => {
    try {
      const result = await revokeInviteAction(id);
      if (result.error) {
        toast.error(result.error);
      }
      if (result.success) {
        toast.success("👍");
      }
    } catch {
      toast.error("Algo deu errado");
    }
  },
});

const makeResendAction = (status: StatusEnum, id: string): ActionConfig => ({
  key: "resend",
  title: "Reenviar Convite",
  description:
    status === StatusEnum.PENDING
      ? "Enviar um lembrete por e-mail?"
      : "Enviar um link de convite novo?",
  icon: <RefreshCwIcon size={16} />,
  isPending: false,
  onConfirm: async () => {
    try {
      const result = await resendInviteAction(id);
      if (result.error) {
        toast.error(result.error);
      }
      if (result.success) {
        toast.success("👍");
      }
    } catch {
      toast.error("Algo deu errado");
    }
  },
});

const makeRemoveUserAction = (id: string, subdomain: string): ActionConfig => ({
  key: "remove",
  title: "Remover Usuário",
  description: "Remover este usuário permanentemente da aplicação?",
  icon: <UserMinus size={16} />,
  isPending: false,
  onConfirm: async () => {
    try {
      const result = await removeMemberAction(subdomain, id);
      if (result.error) {
        toast.error(result.error);
      }
      if (result.success) {
        toast.success("👍");
      }
    } catch {
      toast.error("Algo deu errado");
    }
  },
});

const ACTIONS_BY_STATUS = (
  status: StatusEnum,
  id: string,
  subdomain: string
): ActionConfig[] =>
  ({
    [StatusEnum.PENDING]: [
      makeRevokeAction(StatusEnum.PENDING, id),
      makeResendAction(StatusEnum.PENDING, id),
    ],
    [StatusEnum.EXPIRED]: [
      makeRevokeAction(StatusEnum.EXPIRED, id),
      makeResendAction(StatusEnum.EXPIRED, id),
    ],
    [StatusEnum.ACCEPTED]: [makeRemoveUserAction(id, subdomain)],
    [StatusEnum.REVOKED]: [makeResendAction(StatusEnum.REVOKED, id)],
  })[status] || [];

export default function ActionsButton({
  status,
  invitationId,
  subdomain,
}: {
  status: StatusEnum;
  invitationId: string;
  subdomain: string;
}) {
  const rawActions = useMemo(
    () => ACTIONS_BY_STATUS(status, invitationId, subdomain),
    [status, invitationId, subdomain]
  );

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const actions = useMemo(
    () =>
      rawActions.map((cfg) => ({
        ...cfg,
        isPending: isPending && activeKey === cfg.key,
        onConfirm: () => {
          setActiveKey(cfg.key);
          startTransition(async () => {
            try {
              await cfg.onConfirm();
            } finally {
              setActiveKey(null);
            }
          });
        },
      })),
    [rawActions, isPending, activeKey]
  );

  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Ellipsis size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((cfg) => (
          <DropdownMenuItem asChild key={cfg.key}>
            <ConfirmMenuItem
              onConfirm={cfg.onConfirm}
              title={cfg.title}
              description={cfg.description}
              icon={cfg.icon}
              isPending={cfg.isPending}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
