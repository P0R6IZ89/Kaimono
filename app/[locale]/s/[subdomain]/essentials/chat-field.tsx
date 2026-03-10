"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "../essentialsOld/bubble";
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
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  const [items] = React.useState(essentials);

  const sortedEssentials = React.useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "PURCHASED" ? -1 : 1;
    });
  }, [items]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedEssentials]);

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-3 my-2">
        {sortedEssentials.map((item) => (
          <ChatBubble key={item.id} item={item} currentUserId={currentUserId} />
        ))}
      </div>
    </ScrollArea>
  );
}
