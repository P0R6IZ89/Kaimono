import React, { useActionState, useEffect } from "react";
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
import { useSubdomain } from "@/context/SubdomainContext";
import { updateEssentials } from "@/actions/essentialsActions";
import { useForm } from "react-hook-form";
import { initialState } from "@/util/initial-action-return";
import { toast } from "sonner";

function EditDialog({ row, open, setOpen }: CustomDialogProps) {
  const { title, id, status } = row.original;

  const { subdomain } = useSubdomain();

  const [state, action, isPending] = useActionState(
    updateEssentials,
    initialState
  );

  const form = useForm({
    defaultValues: {
      title: "",
      price: "",
      quantity: "",
      status: status,
      priority: "",
      image: "",
      productUrl: "",
      description: "",
      subdomain: subdomain,
    },
  });
  useEffect(() => {
    if (state.ok) {
      toast.success(state.message);
      form.reset();
      setOpen(false);
    } else if (!state.ok) {
      toast.error(state.message);
    }
  }, [form, setOpen, state.message, state.ok]);

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
                      max={999}
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

            <input value={id} name="id" type="hidden" />
            <input type="hidden" name="subdomain" value={subdomain} />
            <input type="hidden" name="status" value={status} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"outline"}>Voltar</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditDialog;
