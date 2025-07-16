import React from "react";
import { RowCellProps } from "./cell-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { capitalizeFirstLetter } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

dayjs.extend(relativeTime);

function CommentsCell({ row }: RowCellProps) {
  const { comments, commentsCount } = row.original;

  return (
    <div className="pt-4">
      <div className="p-3 h-fit rounded-lg bg-card space-y-2">
        <span className="flex gap-2">
          <p className="text-sm font-semibold">Comentários</p>
          <p className="text-sm">{commentsCount}</p>
        </span>
        <Accordion type="single" collapsible>
          {comments.map((comment, index) => {
            const { authorImage, authorEmail, authorName, createdAt } = comment;
            return (
              <AccordionItem key={index} value="item-1">
                {index === 0 ? (
                  <AccordionTrigger className="hover:no-underline hover:bg-accent">
                    <div className="flex gap-2 w-full space-y-6">
                      <Avatar className="size-6">
                        <AvatarImage
                          src={authorImage ?? undefined}
                          alt={authorName ?? authorEmail}
                        />
                        <AvatarFallback>
                          {authorName
                            ? capitalizeFirstLetter(authorName)
                            : capitalizeFirstLetter(authorEmail ?? "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-full">
                        <span className=" flex justify-between items-center text-xs text-muted-foreground">
                          <p>{authorName ?? authorEmail}</p>
                          <p>{dayjs(createdAt).fromNow()}</p>
                        </span>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                ) : null}
                {index > 0 ? (
                  <AccordionContent className="pt-5">
                    <div className="flex gap-2 w-full space-y-6 pr-7">
                      <Avatar className="size-6">
                        <AvatarImage
                          src={authorImage ?? undefined}
                          alt={authorName ?? authorEmail}
                        />
                        <AvatarFallback>
                          {authorName
                            ? capitalizeFirstLetter(authorName)
                            : capitalizeFirstLetter(authorEmail ?? "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-full">
                        <span className=" flex justify-between items-center text-xs text-muted-foreground">
                          <p>{authorName ?? authorEmail}</p>
                          <p>{dayjs(createdAt).fromNow()}</p>
                        </span>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </AccordionContent>
                ) : null}
              </AccordionItem>
            );
          })}
        </Accordion>
        <Input />
        {/* {JSON.stringify(comments)} */}
      </div>
    </div>
  );
}

export default CommentsCell;
