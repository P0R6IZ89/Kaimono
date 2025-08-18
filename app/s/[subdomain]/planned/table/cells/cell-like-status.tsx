"use client";

import React from "react";
import { RowCellProps } from "./cell-profile";
import { Ban, Check, Clock, Heart } from "lucide-react";
import { toggleLikeAction } from "@/actions/likeAction";
import { Button } from "@/components/ui/button";

function LikeStatusCell({ row }: RowCellProps) {
  const { likesCount, status, id, likedByMe } = row.original;
  const handleLike = async () => {
    try {
      await toggleLikeAction(id);
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };
  return (
    <div className="dark relative flex justify-end">
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 justify-end z-10 text-foreground">
        <Button
          onClick={handleLike}
          variant={"outline"}
          className="flex flex-col h-auto w-full m-auto gap-2 backdrop-blur-sm"
        >
          {likedByMe ? (
            <Heart fill="currentColor" className="size-6" />
          ) : (
            <Heart className="size-6" />
          )}
          <p>{likesCount}</p>
        </Button>
        <Button
          variant={"outline"}
          className="flex flex-col h-auto w-full m-auto gap-2 backdrop-blur-sm"
        >
          {status === "complete" ? <Check className="size-6" /> : null}
          {status === "canceled" ? <Ban className="size-6" /> : null}
          {status === "pending" ? <Clock className="size-6" /> : null}
        </Button>
      </div>
    </div>
  );
}

export default LikeStatusCell;
