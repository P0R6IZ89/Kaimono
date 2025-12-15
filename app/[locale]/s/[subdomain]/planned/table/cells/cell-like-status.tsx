"use client";

import React from "react";
import { Ban, Check, Clock, Heart } from "lucide-react";
import { toggleLikeAction } from "@/actions/likeAction";
import { Button } from "@/components/ui/button";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/[locale]/types/planned";

function LikeStatusCell({ row }: { row: Row<PlannedSchema> }) {
  const { status, id, likedByMe } = row.original;
  const handleLike = async () => {
    try {
      await toggleLikeAction(id);
    } catch {}
  };
  return (
    <div className="dark relative flex justify-end">
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 justify-end z-10 text-foreground">
        <Button onClick={handleLike} variant={"ghost"}>
          {likedByMe ? <Heart className=" fill-red-500 stroke-0" /> : <Heart />}
        </Button>
        <Button variant={"ghost"}>
          {status === "PURCHASED" ? <Check className="text-green-500" /> : null}
          {status === "CANCELLED" ? <Ban className="text-destructive" /> : null}
          {status === "PENDING" ? (
            <Clock className="text-foreground/70" />
          ) : null}
        </Button>
      </div>
    </div>
  );
}

export default LikeStatusCell;
