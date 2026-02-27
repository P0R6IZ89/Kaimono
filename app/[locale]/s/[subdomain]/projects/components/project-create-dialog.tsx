"use client";

import { createProjectAction } from "@/actions/projectActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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
import { initialState } from "@/util/initial-action-return";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function ProjectCreateDialog({
  subdomain,
  className,
  buttonVariant = "default",
  children,
  triggerRef,
}: {
  subdomain: string;
  className?: string;
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  children?: React.ReactNode;
  triggerRef?: React.Ref<HTMLButtonElement>;
}) {
  const [state, action, isPending] = useActionState(
    createProjectAction,
    initialState,
  );
  const t = useTranslations("ProjectsPage");

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      subdomain,
    },
  });

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(t("toast-created"));
    } else if (state.message) {
      toast.error(state.message);
    }
    form.reset();
  }, [form, state, t]);

  return (
    <Dialog>
      <Form {...form}>
        <DialogTrigger asChild>
          <Button
            ref={triggerRef}
            variant={buttonVariant}
            type="submit"
            className={className}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {children ? children : t("create.title")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("create.title")}</DialogTitle>
            <DialogDescription>{t("create.description")}</DialogDescription>
          </DialogHeader>
          <form action={action}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.name-placeholder")}
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
                      <Textarea
                        placeholder={t("form.description-placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <input type="hidden" name="subdomain" defaultValue={subdomain} />
              <Button type="submit">{t("form.create")}</Button>
            </div>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
}
