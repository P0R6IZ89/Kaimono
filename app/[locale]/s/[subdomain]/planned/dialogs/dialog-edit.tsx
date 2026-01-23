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
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubdomain } from "@/context/SubdomainContext";
import { initialState } from "@/util/initial-action-return";
import { Row } from "@tanstack/react-table";
import { Loader2, Upload } from "lucide-react";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function EditPlannedDialog({
  row,
  open,
  onOpenChange,
}: {
  row: Row<PlannedSchema>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
    initialState,
  );
  const [uploadedInfo, setUploadedInfo] = useState<
    string | CloudinaryUploadWidgetInfo | undefined
  >(undefined);
  const [uploadWidgetOpen, setUploadWidgetOpen] = useState(false);

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
      onOpenChange(false);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [onOpenChange, state]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent
        onInteractOutside={(e) => {
          if (uploadWidgetOpen) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (uploadWidgetOpen) e.preventDefault();
        }}
        onFocusOutside={(e) => {
          if (uploadWidgetOpen) e.preventDefault();
        }}
      >
        <Form {...form}>
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
                  <FormItem className="">
                    <FormLabel>{t("priority")}</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger className="">
                          <SelectValue placeholder={t("select-priority")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="LOW">
                              {t("priority-options.LOW")}
                            </SelectItem>
                            <SelectItem value="MEDIUM">
                              {t("priority-options.MEDIUM")}
                            </SelectItem>
                            <SelectItem value="HIGH">
                              {t("priority-options.HIGH")}
                            </SelectItem>
                            <SelectItem value="URGENT">
                              {t("priority-options.URGENT")}
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="">
                    <FormControl>
                      <CldUploadWidget
                        options={{
                          sources: ["local", "url", "camera"],
                        }}
                        uploadPreset="test-preset"
                        onOpen={() => setUploadWidgetOpen?.(true)}
                        onClose={() => setUploadWidgetOpen?.(false)}
                        onSuccess={(result, { widget }) => {
                          const info = result.info;
                          if (!info || typeof info === "string") {
                            widget.close();
                            setUploadWidgetOpen?.(false);
                            return;
                          }
                          field.onChange(info.secure_url);
                          setUploadedInfo(info);
                          widget.close();
                          setUploadWidgetOpen?.(false);
                        }}
                      >
                        {({ open }) => {
                          return (
                            <Button
                              type="button"
                              variant={"secondary"}
                              className="justify-between"
                              onClick={(e) => {
                                e.preventDefault();
                                setUploadWidgetOpen?.(true);
                                open();
                              }}
                            >
                              <p>
                                {uploadedInfo &&
                                typeof uploadedInfo !== "string"
                                  ? `${t("selected")}: ${uploadedInfo.original_filename}.${uploadedInfo.format}`
                                  : `${t("upload-image")}`}
                              </p>
                              <Upload />
                            </Button>
                          );
                        }}
                      </CldUploadWidget>
                    </FormControl>
                    <input
                      type="hidden"
                      name="image"
                      value={field.value ?? ""}
                    />
                    <FormDescription />
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
                <Button type="button" variant="outline">
                  {tD("close")}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
