import { createCommentAction, deleteComment } from "@/actions/commentAction";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { canDeleteComment } from "@/lib/permissions";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { AlertCircle, Ellipsis, Loader2, Send, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";

export default function CommentListCell({
  id,
  comments,
  currentUserId,
  currentUserRole,
}: {
  id: string;
  comments: Partial<Pick<PlannedSchema, "comments">>["comments"];
  currentUserId: PlannedSchema["currentUserId"];
  currentUserRole: PlannedSchema["currentUserRole"];
}) {
  const t = useTranslations("Planned");
  const tErrors = useTranslations("Errors");
  const initialState = { ok: false, error: "" };
  dayjs.extend(relativeTime);
  const [state, action, isPending] = useActionState(
    createCommentAction,
    initialState,
  );

  const form = useForm({
    defaultValues: {
      content: "",
      id: "",
    },
  });
  useEffect(() => {
    if (state?.ok) {
      form.reset({ content: "", id });
    }
  }, [state?.ok, form, id]);
  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
    } catch {}
  };
  if (!comments) {
    return (
      <p className="text-sm text-muted-foreground">{t("comments.empty")}</p>
    );
  }
  return (
    <div>
      {comments.map((comment, index) => {
        const { authorImage, authorEmail, authorName } = comment;
        const canDelete =
          comment.authorId !== null &&
          canDeleteComment({
            role: currentUserRole,
            currentUserId,
            authorId: comment.authorId,
          });

        return (
          <Item key={index} className="p-4">
            <ItemMedia variant={"default"}>
              <Avatar className="size-6">
                {authorImage ? (
                  <AvatarImage
                    src={authorImage ?? undefined}
                    alt={authorName ?? authorEmail ?? ""}
                  />
                ) : (
                  <AvatarFallback>
                    {authorName
                      ? authorName.charAt(0).toUpperCase()
                      : authorEmail
                        ? authorEmail.charAt(0).toUpperCase()
                        : ""}
                  </AvatarFallback>
                )}
              </Avatar>
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>
                <p className="text-xs text-muted-foreground">
                  {authorName ?? authorEmail}
                </p>
              </ItemTitle>
              {comment.content}
            </ItemContent>
            <ItemActions>
              <div className="flex gap-3">
                <p className="text-xs text-muted-foreground">
                  {dayjs(comment.createdAt).fromNow()}
                </p>
                {canDelete ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Ellipsis className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          handleDelete(comment.id);
                        }}
                      >
                        <Trash2 />
                        <span>{t("comments.delete")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </ItemActions>
          </Item>
        );
      })}
      <div className="p-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <Form {...form}>
          <form action={action} className="flex space-x-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t("comments.inputPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <input type="hidden" name="id" value={id} />

            <Button
              variant={"default"}
              disabled={isPending}
              className="flex-none"
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send className="" />
              )}
            </Button>
          </form>
        </Form>
        {state?.error && (
          <Alert variant={"destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{tErrors("error")}</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
