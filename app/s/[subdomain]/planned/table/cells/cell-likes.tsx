import { Badge } from "@/components/ui/badge";
import React from "react";
import { RowCellProps } from "./cell-profile";
import { Heart } from "lucide-react";

function LikesCell({ row }: RowCellProps) {
  const { likesCount, likedByMe } = row.original;
  return (
    <div className="relative -top-8 left-4 z-10">
      <Badge variant={"outline"} className="flex">
        {likedByMe ? <Heart fill="currentColor" /> : <Heart />}
        <p>{likesCount}</p>
      </Badge>
    </div>
  );
}

export default LikesCell;
