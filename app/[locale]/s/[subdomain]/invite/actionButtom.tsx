"use client";
import React, { useMemo, useState, useTransition } from "react";
import { ConfirmMenuItem } from "@/components/dialog/confirmMenuItem";
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { useTranslations } from "next-intl";
import { translateMessage } from "@/lib/translate-message";

type TranslateFn = (
  key: string,
  values?: Record<string, string | number | Date>
) => string;

type ActionConfig = {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isPending: boolean;
  onConfirm: () => Promise<void> | void;
};

const makeRevokeAction = (
  t: TranslateFn,
  tActions: TranslateFn,
  status: StatusEnum,
  id: string
): ActionConfig => ({
  key: "revoke",
  title: t("actions.revoke.title"),
  description: t("actions.revoke.description", { status }),
  icon: <Trash size={16} />,
  isPending: false,
  onConfirm: async () => {
    try {
      const result = await revokeInviteAction(id);
      if (!result.ok) {
        toast.error(translateMessage(tActions, result.message));
      } else if (result.message) {
        toast.success(translateMessage(tActions, result.message));
      }
    } catch {
      toast.error(t("actions.genericError"));
    }
  },
});

const makeResendAction = (
  t: TranslateFn,
  tActions: TranslateFn,
  status: StatusEnum,
  id: string
): ActionConfig => ({
  key: "resend",
  title: t("actions.resend.title"),
  description: t("actions.resend.description", { status }),
  icon: <RefreshCwIcon size={16} />,
  isPending: false,
  onConfirm: async () => {
    try {
      const result = await resendInviteAction(id);
      if (!result.ok) {
        toast.error(translateMessage(tActions, result.message));
      } else if (result.message) {
        toast.success(translateMessage(tActions, result.message));
      }
    } catch {
      toast.error(t("actions.genericError"));
    }
  },
});

const makeRemoveUserAction = (
  t: TranslateFn,
  tActions: TranslateFn,
  id: string,
  subdomain: string
): ActionConfig => ({
  key: "remove",
  title: t("actions.remove.title"),
  description: t("actions.remove.description"),
  icon: <UserMinus size={16} />,
  isPending: false,
  onConfirm: async () => {
    try {
      const result = await removeMemberAction(subdomain, id);
      if (!result.ok) {
        toast.error(translateMessage(tActions, result.message));
      }
      if (result.ok) {
        toast.success(translateMessage(tActions, result.message));
      }
    } catch {
      toast.error(t("actions.genericError"));
    }
  },
});

const ACTIONS_BY_STATUS = (
  t: TranslateFn,
  tActions: TranslateFn,
  status: StatusEnum,
  id: string,
  subdomain: string
): ActionConfig[] =>
  ({
    [StatusEnum.PENDING]: [
      makeRevokeAction(t, tActions, StatusEnum.PENDING, id),
      makeResendAction(t, tActions, StatusEnum.PENDING, id),
    ],
    [StatusEnum.EXPIRED]: [
      makeRevokeAction(t, tActions, StatusEnum.EXPIRED, id),
      makeResendAction(t, tActions, StatusEnum.EXPIRED, id),
    ],
    [StatusEnum.ACCEPTED]: [makeRemoveUserAction(t, tActions, id, subdomain)],
    [StatusEnum.REVOKED]: [makeResendAction(t, tActions, StatusEnum.REVOKED, id)],
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
  const t = useTranslations("Invite");
  const tActions = useTranslations("ActionMessages");

  const rawActions = useMemo(
    () => ACTIONS_BY_STATUS(t, tActions, status, invitationId, subdomain),
    [t, tActions, status, invitationId, subdomain]
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
        <DropdownMenuLabel>{t("actions.label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((cfg) => (
          <ConfirmMenuItem
            key={cfg.key}
            onConfirm={cfg.onConfirm}
            title={cfg.title}
            description={cfg.description}
            icon={cfg.icon}
            isPending={cfg.isPending}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
