import React, { useActionState } from "react";
import { CustomDialogProps } from "./action-dialogv2";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useForm } from "react-hook-form";
import { essentialsSchema } from "@/util/essentials";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubdomain } from "@/context/SubdomainContext";
import { updateEssentials } from "@/actions/essentialsActions";

function InfoDialog({ row, open, setOpen }: CustomDialogProps) {
  const { title, id, price, quantity, status } = row.original;

  const { subdomain } = useSubdomain();

  const [, action, isPending] = useActionState(
    (prevState: unknown, formData: FormData) =>
      updateEssentials(prevState, formData, id).then((result) => result),
    null
  );

  const form = useForm<z.infer<typeof essentialsSchema>>({
    resolver: zodResolver(essentialsSchema),
    defaultValues: {
      title: title,
      price: String(price),
      quantity: String(quantity),
      status: status as "pending" | "purchased" | "canceled" | undefined,
      subdomain: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Voce pode editar o item aqui, não se esqueça de salvar!
          </DialogDescription>
        </DialogHeader>
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
                <FormItem>
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
                <FormItem>
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
            <input type="hidden" name="subdomain" value={subdomain} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"outline"}>Voltar</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit" disabled={isPending}>
                  Salvar
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default InfoDialog;
