"use client";

import { createEssentials } from "@/actions/essentialsActions";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSubdomain } from "@/context/SubdomainContext";
import { ArrowUp, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  title: string;
  price: string;
  status: string;
  quantity: string;
  subdomain: string;
};

export function AddItem() {
  const { subdomain } = useSubdomain();
  const t = useTranslations("Essentials");
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      price: "",
      status: "PENDING",
      quantity: "1",
      subdomain: subdomain,
    },
  });
  const initialState = { error: "" };

  const [state, action, isPending] = useActionState(
    createEssentials,
    initialState,
  );

  useEffect(() => {
    if (state.message?.isSuccess) {
      form.reset();
    } else if (state.error) {
      console.log(state.error);
    }
  }, [state, form]);

  return (
    <Form {...form}>
      <form action={action} className="flex w-full flex-row gap-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder={t("fields.itemNamePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem className="w-20">
              <FormControl>
                <Input min={1} type="number" placeholder="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <input type="hidden" name="subdomain" value={subdomain} />
        <ButtonGroup>
          <Button
            type="submit"
            disabled={isPending}
            aria-label={t("actions.addItem")}
            size="icon"
            variant="default"
          >
            {isPending ? <Loader2 className="animate-spin" /> : <ArrowUp />}
          </Button>
        </ButtonGroup>
      </form>
    </Form>
  );
}
