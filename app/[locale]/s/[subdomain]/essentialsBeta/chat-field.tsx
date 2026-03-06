"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "../essentials/bubble";
import { $Enums } from "@prisma/client";
import React from "react";

type ChatFieldProps = {
  id: string;
  title: string;
  price: number;
  status: $Enums.Status;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
}[];

export function ChatField({
  essentials,
  currentUserId,
}: {
  essentials: ChatFieldProps;
  currentUserId: string;
}) {
  const [item] = React.useState(essentials);
  const sortedEssentials = React.useMemo(() => {
    return [...item].sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "PURCHASED" ? -1 : 1;
    });
  }, [item]);

  return (
    <ScrollArea className="bg-muted/20 flex-1">
      <div className="flex flex-col w-full h-full gap-3">
        {sortedEssentials.map((item) => (
          <ChatBubble key={item.id} item={item} currentUserId={currentUserId} />
        ))}
      </div>
    </ScrollArea>
  );
}
