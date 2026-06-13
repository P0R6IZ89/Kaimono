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
import { initialState } from "@/lib/initial-action-return";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { translateMessage } from "@/lib/translate-message";

export function ProjectCreateDialog({
  className,
  buttonVariant = "default",
  children,
  triggerRef,
}: {
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
  const { subdomain } = useParams<{ subdomain: string }>();

  const [state, action, isPending] = useActionState(
    createProjectAction,
    initialState,
  );
  const t = useTranslations("Projects");
  const tActions = useTranslations("ActionMessages");
  const tErrors = useTranslations("FormErrors");

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      budget: "",
      subdomain,
    },
  });

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(t("toast.created"));
    } else if (state.message) {
      toast.error(
        tErrors.has(state.message)
          ? tErrors(state.message)
          : translateMessage(tActions, state.message),
      );
    }
    form.reset();
  }, [form, state, t, tActions, tErrors]);

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
            {children ? (
              children
            ) : (
              <p className="flex items-center gap-2">
                <Plus />
                {t("create.title")}
              </p>
            )}
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
                      <Textarea
                        placeholder={t("form.descriptionPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.budget")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="9999999999.99"
                        step="1"
                        placeholder={t("form.budgetPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {t("form.budgetDescription")}
                    </p>
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
