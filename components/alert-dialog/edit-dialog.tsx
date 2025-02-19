import React, { useActionState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { updateEssentials } from "@/actions/actions";
import { useForm } from "react-hook-form";
import { essentialsSchema } from "@/lib/schemas/essentials";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/input";
import { Row } from "@tanstack/react-table";
import { TableRowData } from "../table/essentials-columns";

interface EditDialogProps {
  id: string;
  row: Row<TableRowData>;
}

function EditDialog({ id, row }: EditDialogProps) {
  const [state, action, isPending] = useActionState(updateEssentials, null);
  const { title, price, quantity, status } = row.original;
  const form = useForm<z.infer<typeof essentialsSchema>>({
    resolver: zodResolver(essentialsSchema),
    defaultValues: {
      title: title,
      price: String(price),
      status: status,
      quantity: String(quantity),
    },
  });

  return (
    <Form {...form}>
      <form action={action}>
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
      </form>
    </Form>
  );
}

export default EditDialog;
