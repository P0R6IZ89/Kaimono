"use client";

import React, { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createAppAction, type Result } from "@/actions/appActions";
import UserAvatar from "@/components/client/userAvatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { rootDomain } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import { SessionProvider } from "next-auth/react";
import { toast } from "sonner";

type FormValues = { name: string; subdomain: string; description: string };

const initialState: Result = { ok: true };

function NewApp() {
  const form = useForm<FormValues>({
    defaultValues: { name: "", subdomain: "", description: "" },
  });

  const [state, formAction, isPending] = useActionState(
    createAppAction,
    initialState
  );

  useEffect(() => {
    if (state?.ok === false) {
      const id = "create-app-error";
      toast.dismiss(id);
      toast.error(state.message, { id, duration: 5000 });

      if (state.code === "SUBDOMAIN_TAKEN") {
        form.setError("subdomain", {
          message: "Este subdomínio já está em uso.",
        });
      }
      if (state.code === "CUSTOM_DOMAIN_TAKEN") {
        form.setError("subdomain", {
          message: "Esse domínio personalizado já está em uso.",
        });
      }
    }
  }, [state, form]);

  return (
    <div className="flex flex-col gap-4 min-h-dvh max-w-xl m-auto justify-center px-4">
      <Card>
        <CardHeader>
          <CardTitle>Crie um novo aplicativo ✨</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" action={formAction}>
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Nome é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do aplicativo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subdomain"
                rules={{ required: "Subdomínio é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subdomínio</FormLabel>
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {state?.ok === false && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
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
                Criar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <SessionProvider>
        <div className="flex">
          <UserAvatar />
        </div>
      </SessionProvider>
    </div>
  );
}

export default NewApp;
