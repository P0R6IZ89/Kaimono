"use client";

import { Badge } from "@/components/ui/badge";
import { $Enums } from "@prisma/client";
import React from "react";
import { updateStatusEssentials } from "@/actions/essentialsActions";
import { deleteEssentials } from "@/actions/essentialsActions";
import { useSubdomain } from "@/context/SubdomainContext";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatBubbleProps {
  id: string;
  title: string;
  price: number;
  status: $Enums.Status;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    id: string;
  };
}

function getBubbleAlignment(userId: string, currentUserId: string) {
  return userId === currentUserId;
}

export function ChatBubble({
  item,
  currentUserId,
}: {
  item: ChatBubbleProps;
  currentUserId: string;
}) {
  const router = useRouter();
  const { subdomain } = useSubdomain();
  const [status, setStatus] = React.useState<$Enums.Status>(item.status);
  const [isSaving, startTransition] = React.useTransition();

  React.useEffect(() => {
    setStatus(item.status);
  }, [item.status]);

  const purchased = status === "PURCHASED";
  const isCancelled = status === "CANCELLED";
  const bubbleBackground = purchased
    ? "line-through text-background/80 bg-foreground/80"
    : "text-foreground";
  const bubbleStyle = getBubbleAlignment(item.user.id, currentUserId)
    ? `${bubbleBackground} rounded-bl-md self-end`
    : `${bubbleBackground} rounded-br-md self-start`;

  function handleClick() {
    if (isCancelled || isSaving) return;

    const previousStatus = status;
    const nextStatus: $Enums.Status =
      status === "PURCHASED" ? "PENDING" : "PURCHASED";

    setStatus(nextStatus);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", item.id);
      formData.set("status", nextStatus);
      formData.set("subdomain", subdomain);

      try {
        const result = await updateStatusEssentials(null, formData);
        if (!result.ok) {
          setStatus(previousStatus);
        }
      } catch {
        setStatus(previousStatus);
      }
    });
  }

  function onDelete() {
    if (isSaving) return;

    startTransition(async () => {
      try {
        const result = await deleteEssentials(null, item.id, subdomain);
        if (result.status === "success") {
          router.refresh();
        }
      } catch {}
    });
  }

  return (
    <button
      type="button"
      key={item.id}
      onClick={handleClick}
      disabled={isCancelled || isSaving}
      className={`${bubbleStyle} w-fit px-4 py-2 border rounded-t-md shadow-md text-left transition-opacity disabled:cursor-not-allowed disabled:opacity-70`}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="flex flex-col">
            <div className="flex flex-row gap-2 items-center">
              <p>{item.title}</p>
              {item.quantity > 0 && (
                <Badge
                  variant={"outline"}
                  className={`${purchased ? "text-background/80" : "text-foreground"}`}
                >
                  {item.quantity}
                </Badge>
              )}
            </div>
            {status === "PENDING" && (
              <p className="text-xs text-muted-foreground">{status}</p>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onDelete} disabled={isSaving}>
            <Trash /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </button>
  );
}
