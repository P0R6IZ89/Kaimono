"use client";

import { sendContactMessage } from "@/actions/contactActions";
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
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/contact-schema";
import { translateMessage } from "@/lib/translate-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

type ContactFormValues = z.infer<typeof contactSchema>;

type ContactFormProps = {
  subdomain: string;
  defaultFullName: string;
  defaultEmail: string;
};

export function ContactForm({
  subdomain,
  defaultFullName,
  defaultEmail,
}: ContactFormProps) {
  const t = useTranslations("Contact");
  const tMessages = useTranslations("Contact.messages");
  const [isPending, startTransition] = useTransition();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subdomain,
      fullName: defaultFullName,
      email: defaultEmail,
      title: "",
      description: "",
    },
  });

  function onSubmit(values: ContactFormValues) {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await sendContactMessage(values);
        const message =
          translateMessage(tMessages, result.message) ?? tMessages("failed");

        if (!result.ok) {
          toast.error(message);
          return;
        }

        toast.success(message);
        form.reset({
          subdomain,
          fullName: values.fullName,
          email: values.email,
          title: "",
          description: "",
        });
      } catch {
        toast.error(tMessages("failed"));
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.fullName")}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  maxLength={100}
                  placeholder={t("placeholders.fullName")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.email")}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="email"
                  maxLength={254}
                  type="email"
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.subject")}</FormLabel>
              <FormControl>
                <Input
                  maxLength={160}
                  placeholder={t("placeholders.subject")}
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
              <FormLabel>{t("fields.message")}</FormLabel>
              <FormControl>
                <Textarea
                  maxLength={5000}
                  rows={7}
                  placeholder={t("placeholders.message")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                {t("sending")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
