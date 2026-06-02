"use client";

import React, { useActionState } from "react";
import { useForm } from "react-hook-form";
import { createAppAction } from "@/actions/appActions";
import { initialState } from "@/lib/initial-action-return";
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
import { AlertCircle, Info, Loader2 } from "lucide-react";
import UserAvatar from "@/components/auth/userAvatar";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { rootDomain } from "@/lib/variables";

type FormValues = { name: string; subdomain: string; description: string };

export default function NewWorkspaceForm({
  session,
}: {
  session: Session | null;
}) {
  const t = useTranslations("NewWorkspace");
  const tErrors = useTranslations("Errors");
  const form = useForm<FormValues>({
    defaultValues: { name: "", subdomain: "", description: "" },
  });

  const [state, formAction, isPending] = useActionState(
    createAppAction,
    initialState,
  );

  const getErrorText = () => {
    if (!state || state.ok !== false) return "";
    const key = state.errorKey ?? state.message ?? "unexpected";
    const params = state.errorParams as
      | Record<string, string | number | Date>
      | undefined;

    try {
      return tErrors(key, params);
    } catch {
      return String(state.message ?? key ?? "");
    }
  };

  return (
    <div className="flex flex-col gap-4 min-h-dvh max-w-xl m-auto justify-center px-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("descriptionContent")}</CardDescription>
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
                    <FormLabel>{t("workspaceName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("workspaceNamePlaceholder")}
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
                    <FormControl className="w-full">
                      <ButtonGroup>
                        <InputGroup>
                          <InputGroupInput
                            placeholder="your-workspace"
                            {...field}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText>.{rootDomain}</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupAddon align="inline-end">
                            <Popover>
                              <PopoverTrigger asChild>
                                <InputGroupAddon>
                                  <InputGroupButton
                                    variant="secondary"
                                    size="icon-xs"
                                  >
                                    <Info />
                                  </InputGroupButton>
                                </InputGroupAddon>
                              </PopoverTrigger>
                              <PopoverContent align="end">
                                <p className="text-sm">{t("subdomainHelp")}</p>
                              </PopoverContent>
                            </Popover>
                          </InputGroupAddon>
                        </InputGroup>
                      </ButtonGroup>
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
                        placeholder={t("descriptionPlaceholder")}
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
                  <AlertDescription>{getErrorText()}</AlertDescription>
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
                {t("createButton")}
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
