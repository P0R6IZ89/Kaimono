"use client";

import React, { useActionState } from "react";
import { useForm } from "react-hook-form";
import { createAppAction } from "@/actions/appActions";
import { initialState } from "@/util/initial-action-return";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { AlertCircle, Loader2 } from "lucide-react";
import UserAvatar from "@/components/auth/userAvatar";
import { rootDomain } from "@/lib/utils";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";

type FormValues = { name: string; subdomain: string; description: string };

export default function NewAppForm({ session }: { session: Session | null }) {
  const t = useTranslations("NewApp");
  const tErrors = useTranslations("Errors");
  const form = useForm<FormValues>({
    defaultValues: { name: "", subdomain: "", description: "" },
  });

  const [state, formAction, isPending] = useActionState(
    createAppAction,
    initialState
  );

  return (
    <div className="flex flex-col gap-4 min-h-dvh max-w-xl m-auto justify-center px-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description-content")}</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="space-y-4" action={formAction}>
              <FormField
                control={form.control}
                name="name"
                rules={{ required: tErrors("required-field") }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("app-name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("app-name-placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subdomain"
                rules={{ required: tErrors("required-field") }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("subdomain")}</FormLabel>
                    <FormControl>
                      <div className="relative flex">
                        <Input
                          className="w-full rounded-r-none focus:z-10"
                          {...field}
                        />
                        <span className="tracking-wide bg-gray-100 px-3 border border-l-0 border-input rounded-r-md text-gray-500 min-h-[36px] flex items-center">
                          .{rootDomain}
                        </span>
                      </div>
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
                    <FormLabel>{t("description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        className="resize-none"
                        placeholder={t("description-placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {state?.ok === false && state.message && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{tErrors("error")}</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full"
                type="submit"
                disabled={isPending}
                aria-busy={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("create-button")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex">
        <UserAvatar user={session?.user} />
      </div>
    </div>
  );
}
