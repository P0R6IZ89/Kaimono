"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "./bubble";
import { $Enums } from "@/prisma/generated/prisma";
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
  const hasScrolledInitiallyRef = React.useRef(false);

  const sortedEssentials = React.useMemo(() => {
    return [...essentials].sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "PURCHASED" ? -1 : 1;
    });
  }, [essentials]);

  React.useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: hasScrolledInitiallyRef.current ? "smooth" : "auto",
      block: "end",
    });
    hasScrolledInitiallyRef.current = true;
  }, [sortedEssentials]);

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-3 my-2 p-4">
        {sortedEssentials.map((item) => (
          <ChatBubble key={item.id} item={item} currentUserId={currentUserId} />
        ))}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </ScrollArea>
  );
}
