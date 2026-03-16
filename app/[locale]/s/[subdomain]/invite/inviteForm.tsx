"use client";
import React, { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createInviteAction } from "@/actions/invitationActions";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface AppData {
  subdomain: string;
  id: string;
  name: string;
  description: string | null;
  image: string | null;
}

interface InviteFormProps {
  app: AppData | null;
}

function InviteForm({ app }: InviteFormProps) {
  const t = useTranslations("Invite");
  const tCommon = useTranslations("Common");
  const initialState = { ok: false, message: "" };
  const [state, action, isPending] = useActionState(
    createInviteAction,
    initialState,
  );

  const form = useForm({
    defaultValues: {
      appName: app?.name || "",
      appId: app?.id || "",
      email: "",
      role: "MEMBER",
    },
  });
  useEffect(() => {
    if (state) {
      if (state.ok) {
        toast.success(state.message);
      } else if (state.message) {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <Form {...form}>
      <form action={action} className="space-y-4">
        <Input type="hidden" name="appId" value={app?.id} />
        <Input type="hidden" name="appName" value={app?.name} />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.email")}</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.role")}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue="MEMBER">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">
                      {tCommon("roles.MEMBER")}
                    </SelectItem>
                    <SelectItem value="OWNER">{tCommon("roles.OWNER")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            t("form.submit")
          )}{" "}
        </Button>
      </form>
    </Form>
  );
}

export default InviteForm;
