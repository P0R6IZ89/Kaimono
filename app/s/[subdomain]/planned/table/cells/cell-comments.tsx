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
        {comments.length === 1 ? (
          <div className="flex gap-2 w-full space-y-6 py-4">
            <Avatar className="size-6">
              <AvatarImage
                src={comments[0].authorImage ?? undefined}
                alt={comments[0].authorName ?? comments[0].authorEmail}
              />
              <AvatarFallback>
                {comments[0].authorName
                  ? capitalizeFirstLetter(comments[0].authorName)
                  : capitalizeFirstLetter(comments[0].authorEmail ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="w-full">
              <span className=" flex justify-between items-center text-xs text-muted-foreground">
                <p>{comments[0].authorName ?? comments[0].authorEmail}</p>
                <p>{dayjs(comments[0].createdAt).fromNow()}</p>
              </span>
              <p className="text-sm">{comments[0].content}</p>
            </div>
          </div>
        ) : (
          <Accordion type="single" collapsible>
            {comments.map((comment, index) => {
              const { authorImage, authorEmail, authorName, createdAt } =
                comment;
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
                    <AccordionContent className="pt-7">
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
        )}
        {/* <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex space-x-8"
          >
            <Input type="text" />
            <Button variant={"outline"}>
              <Send />
            </Button>
          </form>
        </Form> */}
        {/* {JSON.stringify(comments)} */}
      </div>
    </div>
  );
}

export default CommentsCell;
