import React from "react";
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
      <form action={(formData: FormData) => updateEssentials(id, formData)}>
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
      </form>
    </Form>
  );
}

export default EditDialog;
