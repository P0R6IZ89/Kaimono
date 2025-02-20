import React, { useActionState, useEffect } from "react";
import { CustomDialogProps } from "../action-dialogv2";
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
import { essentialsSchema } from "@/lib/schemas/essentials";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEssentials } from "@/actions/actions";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

function InfoDialog({ row, open, setOpen }: CustomDialogProps) {
  const { toast } = useToast();

  const { title, id, price, quantity, status } = row.original;

  const [state, action, isPending] = useActionState(
    (prevState: unknown, formData: FormData) =>
      updateEssentials(prevState, formData, id).then((result) => result),
    null
  );

  useEffect(() => {
    if (state) {
      if (state.status === "success") {
        toast({
          title: "Sucesso!",
          description: state.message,
          variant: "default",
        });
      } else if (state.status === "error") {
        toast({
          title: "Error",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);

  const form = useForm<z.infer<typeof essentialsSchema>>({
    resolver: zodResolver(essentialsSchema),
    defaultValues: {
      title: title,
      price: String(price),
      quantity: String(quantity),
      status: status as "pending" | "purchased" | "canceled" | undefined,
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit the {title}</DialogTitle>
          <DialogDescription>
            Depois de editar o item, não se esqueça de clicar em salvar!
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
