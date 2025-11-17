import { updatePlanned } from "@/actions/plannedActions";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSubdomain } from "@/context/SubdomainContext";
import { initialState } from "@/util/initial-action-return";
import { Row } from "@tanstack/react-table";
import { Loader2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function EditPlannedDialog({ row }: { row: Row<PlannedSchema> }) {
  const t = useTranslations("PlannedPage");
  const tD = useTranslations("Dialog");
  const { subdomain } = useSubdomain();
  const {
    id,
    title,
    price,
    priority,
    quantity,
    productUrl,
    description,
    status,
    image,
  } = row.original;
  const [state, action, isPending] = useActionState(
    updatePlanned,
    initialState
  );
  const form = useForm({
    defaultValues: {
      id,
      title,
      price,
      priority,
      quantity,
      status,
      productUrl: productUrl || "",
      description: description || "",
      subdomain,
      image: image || "",
    },
  });
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);
  return (
    <Dialog>
      <Form {...form}>
        <DialogTrigger asChild>
          <Button variant={"outline"}>
            <Pencil />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form action={action}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{t("edit-description")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("item-name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("item-name")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("price")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("price")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("quantity")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("quantity")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("priority")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("priority")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("link")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description-comment")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Input type="hidden" name="image" defaultValue={image || ""} />
              <Input type="hidden" name="id" defaultValue={id} />
              <Input type="hidden" name="subdomain" defaultValue={subdomain} />
              <Input type="hidden" name="status" defaultValue={status} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{tD("close")}</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
}
