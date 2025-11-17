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
  const t = useTranslations("InvitePage");
  const initialState = { error: "" };
  const [state, action, isPending] = useActionState(
    createInviteAction,
    initialState
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
      if (state.success) {
        toast.success("Convite enviado com suscesso!");
      } else if (state.error) {
        toast.error(state.error);
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
              <FormLabel>{t("email")}</FormLabel>
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
              <FormLabel>{t("invitee-role")}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue="MEMBER">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">{t("roles.MEMBER")}</SelectItem>
                    <SelectItem value="OWNER">{t("roles.OWNER")}</SelectItem>
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
            t("invite-button")
          )}{" "}
        </Button>
      </form>
    </Form>
  );
}

export default InviteForm;
