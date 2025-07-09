"use client";

import { useForm } from "react-hook-form";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";

import { createEssentials } from "@/actions/essentialsActions";
import { useSubdomain } from "@/context/SubdomainContext";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FormValues = {
  title: string;
  price: string;
  status: string;
  quantity: string;
  subdomain: string;
};

export function CreateEssentialDialog() {
  const { subdomain } = useSubdomain();
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      price: "",
      status: "pending",
      quantity: "",
      subdomain: subdomain || "",
    },
  });
  const initialState = { error: "" };

  const [state, action, isPending] = useActionState(
    createEssentials,
    initialState
  );

  useEffect(() => {
    if (state.message?.isSuccess) {
      toast.success("Item criado com sucesso!");
      form.reset();
    }
  }, [state.message?.isSuccess, form]);

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
                  <Input {...field} />
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
            {state?.error && (
              <Alert variant={"destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro:</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </div>
          <input type="hidden" name="subdomain" value={subdomain} />
          <input type="hidden" name="status" value={"pending"} />
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
