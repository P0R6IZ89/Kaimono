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
import { useTranslations } from "next-intl";

function EditDialog({ row, open, setOpen }: CustomDialogProps) {
  const t = useTranslations("Dialog");
  const { title, price, quantity, id, status } = row.original;
  const { subdomain } = useSubdomain();
  const [state, action, isPending] = useActionState(
    updateEssentials,
    initialState
  );
  const form = useForm({
    defaultValues: {
      title,
      price,
      quantity,
      status: status,
      priority: "",
      image: "",
      productUrl: "",
      description: "",
      subdomain: subdomain,
    },
  });
  useEffect(() => {
    if (open) {
      form.reset({
        title,
        price,
        quantity,
        status,
        priority: "",
        image: "",
        productUrl: "",
        description: "",
        subdomain,
      });
    }
  }, [open, title, price, quantity, status, subdomain, form]);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("edit-description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form action={action}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("item-name")}</FormLabel>
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
                  <FormLabel>{t("item-price")}</FormLabel>
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
                  <FormLabel>{t("item-quantity")}</FormLabel>
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

            <input type="hidden" name="id" defaultValue={String(id)} />
            <input type="hidden" name="subdomain" defaultValue={subdomain} />
            <input type="hidden" name="status" defaultValue={status} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"outline"}>{t("close")}</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {t("save-changes")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditDialog;
