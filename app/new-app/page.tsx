"use client";
import { createAppAction } from "@/actions/actions";
import UserAvatar from "@/components/client/userAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { rootDomain } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { SessionProvider } from "next-auth/react";
import React, { useActionState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome do aplicativo deve ter pelo menos 3 caracteres.",
  }),
  subdomain: z.string().min(3, {
    message: "O subdomínio deve ter pelo menos 3 caracteres.",
  }),
  description: z.string(),
});

function NewApp() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subdomain: "",
      description: "",
    },
  });

  const initialState = { error: "" };

  const [state, formaction, isPending] = useActionState(
    createAppAction,
    initialState
  );
  return (
    <div className="flex flex-col gap-4 min-h-dvh max-w-xl m-auto justify-center pl-8 pr-8">
      <Card className="min-w-lg">
        <CardHeader>
          <CardTitle>Crie um novo aplicativo ✨</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" action={formaction}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do applicativo</FormLabel>
                    <FormControl>
                      <Input placeholder="familia-app" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subdomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subdomínio</FormLabel>
                    <FormControl>
                      <div className="relative flex">
                        <Input
                          className="w-full rounded-r-none focus:z-10"
                          placeholder="app-0418"
                          {...field}
                        />
                        <span className="tracking-wide bg-gray-100 px-3 border border-l-0 border-input rounded-r-md text-gray-500 min-h-[36px] flex items-center">
                          .{rootDomain}
                        </span>
                      </div>
                    </FormControl>
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
                      <Textarea
                        placeholder="App da família"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <p aria-live="polite">{state?.error}</p>
              <Button className="w-full" type="submit" disabled={isPending}>
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
