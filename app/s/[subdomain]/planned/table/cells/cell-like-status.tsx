"use client";

import { Badge } from "@/components/ui/badge";
import React from "react";
import { RowCellProps } from "./cell-profile";
import { Ban, Check, Heart } from "lucide-react";
import { toggleLikeAction } from "@/actions/likeAction";

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
    <div className="dark flex justify-between relative -top-8 px-4 z-10 text-foreground">
      <Badge
        onClick={handleLike}
        variant={"outline"}
        className="flex gap-2 backdrop-blur-md transition ease-in-out hover:scale-150 "
      >
        {likedByMe ? <Heart fill="currentColor" /> : <Heart />}
        <p>{likesCount}</p>
      </Badge>
      <Badge variant={"outline"} className="backdrop-blur-sm">
        {status === "complete" ? <Check /> : null}
        {status === "canceled" ? <Ban /> : null}
        {status}
      </Badge>
    </div>
  );
}

export default LikeStatusCell;
