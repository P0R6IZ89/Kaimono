import React, { useActionState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AlertCircle, Ellipsis, Loader2, Send, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { createCommentAction, deleteComment } from "@/actions/commentAction";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

dayjs.extend(relativeTime);

function CommentsCell({ row }: RowCellProps) {
  const { comments, commentsCount, id } = row.original;
  const form = useForm({
    defaultValues: {
      content: "",
      id: "",
    },
  });
  const initialState = { error: "" };
  const [state, action, isPending] = useActionState(
    createCommentAction,
    initialState
  );
  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="pt-4 px-2">
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
                <div className="flex gap-2">
                  <p>{dayjs(comments[0].createdAt).fromNow()}</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="">
                      <Ellipsis className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          handleDelete(comments[0].id);
                        }}
                      >
                        <Trash2 />
                        <span>Deletar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </span>
              <p className="text-sm">{comments[0].content}</p>
            </div>
          </div>
        ) : (
          <Accordion type="single" collapsible>
            {comments.map((comment, index) => {
              const { authorImage, authorEmail, authorName } = comment;
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
                            <div className="flex gap-2">
                              <p>{dayjs(comments[0].createdAt).fromNow()}</p>
                              <DropdownMenu>
                                <DropdownMenuTrigger className="">
                                  <Ellipsis className="size-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      handleDelete(comments[0].id);
                                    }}
                                  >
                                    <Trash2 />
                                    <span>Deletar</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
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
                            <div className="flex gap-2">
                              <p>{dayjs(comments[0].createdAt).fromNow()}</p>
                              <DropdownMenu>
                                <DropdownMenuTrigger className="">
                                  <Ellipsis className="size-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      handleDelete(comments[0].id);
                                    }}
                                  >
                                    <Trash2 />
                                    <span>Deletar</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
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
        <Form {...form}>
          <form action={action} className="flex space-x-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Input type="hidden" name="id" value={id} disabled={isPending} />

            <Button
              variant={"outline"}
              disabled={isPending}
              className="flex-none"
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </form>
        </Form>
        {state?.error && (
          <Alert variant={"destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro:</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

export default CommentsCell;
