"use client";

import {
  deleteProjectAction,
  editProjectAction,
} from "@/actions/projectActions";
import { ProjectWithPlanned } from "@/app/[locale]/types/projects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubdomain } from "@/context/SubdomainContext";
import { ActionResult, initialState } from "@/lib/initial-action-return";
import { EllipsisVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { translateMessage } from "@/lib/translate-message";

export function ProjectEditDialog({
  project,
}: {
  project: ProjectWithPlanned;
}) {
  const t = useTranslations("Projects");
  const tActions = useTranslations("ActionMessages");
  const tCommon = useTranslations("Common");
  const { subdomain } = useSubdomain();
  const { id, name, description } = project;
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState<ActionResult, FormData>(
    editProjectAction,
    initialState,
  );
  const [deleteState, setDeleteState] = useState<ActionResult>(initialState);
  const [isDeletePending, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(t("toast.updated"));
      setOpen(false);
    } else if (state.message) {
      toast.error(translateMessage(tActions, state.message));
    }
  }, [state, t, tActions]);

  useEffect(() => {
    if (!deleteState.message) return;
    const message = translateMessage(tActions, deleteState.message);

    if (deleteState.ok) {
      toast.success(message);
      setOpen(false);
    } else {
      toast.error(message);
    }
  }, [deleteState, tActions]);

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteProjectAction(subdomain, id);
      setDeleteState(result);
    });
  }

  const form = useForm({
    defaultValues: {
      id,
      name,
      description: description || "",
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <DialogTrigger asChild>
          <Button variant={"ghost"} size={"sm"}>
            <EllipsisVertical className="text-muted-foreground" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form action={action}>
            <DialogHeader>
              <DialogTitle>{project.name}</DialogTitle>
              <DialogDescription>{t("edit.description")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input type="hidden" defaultValue={id} name="id" />
              <Input type="hidden" defaultValue={subdomain} name="subdomain" />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.namePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.description")}</FormLabel>
                    <FormControl>
                      <Textarea {...field}></Textarea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                variant={"destructive"}
                className="mr-auto"
                type="button"
                disabled={isDeletePending}
                onClick={handleDelete}
              >
                {t("edit.delete")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {tCommon("actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
}
