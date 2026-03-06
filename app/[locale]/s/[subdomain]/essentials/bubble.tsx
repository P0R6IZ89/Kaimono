import { $Enums } from "@prisma/client";
import React from "react";

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
  return userId === currentUserId ? "self-end" : "self-start";
}

export function ChatBubble({
  item,
  currentUserId,
}: {
  item: ChatBubbleProps;
  currentUserId: string;
}) {
  const purchased = item.status === "PURCHASED";
  const bubbleBackground = purchased ? "dark line-through" : "";
  const userMessage = true;
  const bubbleStyle = userMessage
    ? `${bubbleBackground} border bg-background/80 rounded-bl-md rounded-t-md text-foreground self-end`
    : "bg-background rounded-br-md rounded-t-md text-foreground self-start";

  const aligment = getBubbleAlignment(item.user.id, currentUserId);

  return (
    <div
      key={item.id}
      className={`${bubbleStyle} ${aligment} w-fit px-4 py-2 `}
    >
      {item.title}
    </div>
  );
}
