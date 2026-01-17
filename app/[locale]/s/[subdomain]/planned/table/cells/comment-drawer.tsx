import { PlannedSchema } from "@/app/[locale]/types/planned";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MessageCircle } from "lucide-react";
import React from "react";
import CommentListCell from "./comment-list";

export default function CommentsDrawer({
  id,
  comments,
  commentsCount,
}: {
  id: string;
  comments: Partial<Pick<PlannedSchema, "comments">>["comments"];
  commentsCount: Partial<Pick<PlannedSchema, "commentsCount">>["commentsCount"];
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant={"ghost"}>
          <React.Fragment>
            <MessageCircle />
            {commentsCount && commentsCount > 0 ? (
              <span className="text-sm">{commentsCount}</span>
            ) : null}
          </React.Fragment>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="md:w-2xl mx-auto">
        <div className="w-full mx-auto">
          <DrawerHeader>
            <DrawerTitle>Comments</DrawerTitle>
          </DrawerHeader>
          <CommentListCell id={id} comments={comments} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
