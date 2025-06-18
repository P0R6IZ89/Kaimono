"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

import { AlertCircle, Loader2 } from "lucide-react";
import { essentialsSchema } from "@/util/essentials";
import { useActionState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { createEssentials } from "@/actions/essentialsActions";
import { useSubdomain } from "@/context/SubdomainContext";

export function CreateEssentialDialog() {
  const form = useForm<z.infer<typeof essentialsSchema>>({
    resolver: zodResolver(essentialsSchema),
    defaultValues: {
      title: "",
      price: "",
      status: "pending",
      quantity: "",
      subdomain: "",
    },
  });

  const { subdomain } = useSubdomain();
  const [error, action, isPending] = useActionState(createEssentials, null);
  return (
    <>
      <Form {...form}>
        <form action={action} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do produto</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Chocolate" {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 500"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input
                    min={1}
                    max={99}
                    type="number"
                    placeholder="1-99"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            {error ? (
              <Alert variant={"destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </div>
          <input type="hidden" name="subdomain" value={subdomain} />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
