"use client";

import { deleteTask, updatePlanned } from "@/actions/plannedActions";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { ConfirmDialog } from "@/components/dialog/confirmMenuItem";
import { ResponsiveDialogDrawer } from "@/components/dialog/responsive-dialog-drawer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSubdomain } from "@/context/SubdomainContext";
import { ActionResult, initialState } from "@/lib/initial-action-return";
import { translateMessage } from "@/lib/translate-message";
import { cn } from "@/lib/utils";
import { Row } from "@tanstack/react-table";
import {
  AlertCircle,
  DollarSign,
  Flag,
  ImageIcon,
  Link2,
  Loader2,
  Minus,
  PackagePlus,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { useTranslations } from "next-intl";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const priorityIconClassNames: Record<(typeof priorityOptions)[number], string> =
  {
    LOW: "text-emerald-500",
    MEDIUM: "text-sky-500",
    HIGH: "text-amber-500",
    URGENT: "text-destructive",
  };

type EditPlannedFormValues = {
  id: string;
  title: string;
  price: string;
  priority: (typeof priorityOptions)[number];
  quantity: string;
  status: PlannedSchema["status"];
  productUrl: string;
  description: string;
  subdomain: string;
  image: string;
};

export function EditPlannedDialog({
  row,
  open,
  onOpenChange,
}: {
  row: Row<PlannedSchema>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Planned");
  const tActions = useTranslations("ActionMessages");
  const tCommon = useTranslations("Common");
  const tErrors = useTranslations("Errors");
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
  const [state, action, isPending] = useActionState<ActionResult, FormData>(
    updatePlanned,
    initialState,
  );
  const [uploadedInfo, setUploadedInfo] = useState<
    CloudinaryUploadWidgetInfo | undefined
  >(undefined);
  const [uploadWidgetOpen, setUploadWidgetOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const handledStateRef = useRef<ActionResult | null>(null);

  const form = useForm<EditPlannedFormValues>({
    defaultValues: {
      id,
      title,
      price: String(price),
      priority,
      quantity: String(quantity),
      status,
      productUrl: productUrl ?? "",
      description: description ?? "",
      subdomain,
      image: image ?? "",
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      id,
      title,
      price: String(price),
      priority,
      quantity: String(quantity),
      status,
      productUrl: productUrl ?? "",
      description: description ?? "",
      subdomain,
      image: image ?? "",
    });
    setUploadedInfo(undefined);
  }, [
    description,
    form,
    id,
    image,
    open,
    price,
    priority,
    productUrl,
    quantity,
    status,
    subdomain,
    title,
  ]);

  useEffect(() => {
    if (!state.message || handledStateRef.current === state) return;
    handledStateRef.current = state;

    if (state.ok) {
      toast.success(translateMessage(tActions, state.message));
      setUploadWidgetOpen(false);
      setUploadedInfo(undefined);
      onOpenChange(false);
    } else {
      toast.error(translateMessage(tActions, state.message));
    }
  }, [onOpenChange, state, tActions]);

  const uploadButtonLabel = uploadedInfo
    ? `${t("feedback.selected")}: ${uploadedInfo.original_filename}.${uploadedInfo.format}`
    : t("uploadImage");

  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        const result = await deleteTask(id);
        const message =
          translateMessage(tActions, result.message) ??
          (result.ok
            ? t("feedback.actionSuccess")
            : t("feedback.actionFailed"));

        if (!result.ok) {
          toast.error(message);
          return;
        }

        toast.success(message);
        setConfirmDeleteOpen(false);
        setUploadWidgetOpen(false);
        setUploadedInfo(undefined);
        onOpenChange(false);
      } catch {
        toast.error(t("feedback.actionFailed"));
      }
    });
  };

  return (
    <ResponsiveDialogDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={t("editDescription")}
      preventClose={uploadWidgetOpen}
      contentClassName="sm:max-w-[34rem]"
      modal
    >
      <Form {...form}>
        <form action={action} className="space-y-4">
          <section className="rounded-lg border bg-card/80 p-4 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Pencil className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold leading-tight">
                  {t("edit.title")}
                </h3>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {t("edit.description")}
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="productUrl"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>{t("fields.link")}</FormLabel>
                  <FormControl>
                    <InputGroup className="bg-background/80">
                      <InputGroupAddon>
                        <Link2 className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="url"
                        {...field}
                        placeholder={t("fields.linkPlaceholder")}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>{t("fields.itemName")}</FormLabel>
                  <FormControl>
                    <InputGroup className="bg-background/80">
                      <InputGroupAddon>
                        <PackagePlus className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        placeholder={t("fields.itemNamePlaceholder")}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.price")}</FormLabel>
                    <FormControl>
                      <InputGroup className="bg-background/80">
                        <InputGroupAddon>
                          <DollarSign className="size-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          type="number"
                          min={0}
                          step="any"
                          inputMode="decimal"
                          {...field}
                          placeholder={t("fields.pricePlaceholder")}
                          onChange={(event) =>
                            field.onChange(event.target.value)
                          }
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => {
                  const quantityValue = Number(field.value || 1);
                  const setQuantity = (nextValue: number) => {
                    field.onChange(String(Math.max(1, nextValue)));
                  };

                  return (
                    <FormItem>
                      <FormLabel>{t("fields.quantity")}</FormLabel>
                      <FormControl>
                        <div className="flex items-center rounded-md border border-input bg-background/80 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="mx-1 shrink-0"
                            onClick={() => setQuantity(quantityValue - 1)}
                            aria-label={t("fields.decreaseQuantity")}
                          >
                            <Minus />
                          </Button>
                          <Input
                            min={1}
                            step={1}
                            inputMode="numeric"
                            {...field}
                            placeholder={t("fields.quantityPlaceholder")}
                            className="h-full border-0 bg-transparent text-center shadow-none focus-visible:ring-0"
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="mx-1 shrink-0"
                            onClick={() => setQuantity(quantityValue + 1)}
                            aria-label={t("fields.increaseQuantity")}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>{t("fields.priority")}</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full bg-background/80">
                        <SelectValue
                          placeholder={
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Flag className="size-4" />
                              {t("fields.priorityPlaceholder")}
                            </span>
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {priorityOptions.map((priorityOption) => (
                            <SelectItem
                              key={priorityOption}
                              value={priorityOption}
                            >
                              <span className="flex items-center gap-2">
                                <Flag
                                  className={cn(
                                    "size-4",
                                    priorityIconClassNames[priorityOption],
                                  )}
                                />
                                {tCommon(`priority.${priorityOption}`)}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>{t("fields.image")}</FormLabel>
                  <FormControl>
                    <CldUploadWidget
                      options={{
                        sources: ["local", "url", "camera"],
                      }}
                      uploadPreset="test-preset"
                      onOpen={() => setUploadWidgetOpen(true)}
                      onClose={() => setUploadWidgetOpen(false)}
                      onSuccess={(result, { widget }) => {
                        const info = result.info;
                        if (!info || typeof info === "string") {
                          widget.close();
                          setUploadWidgetOpen(false);
                          return;
                        }
                        field.onChange(info.secure_url);
                        setUploadedInfo(info);
                        widget.close();
                        setUploadWidgetOpen(false);
                      }}
                    >
                      {({ open: openUploadWidget }) => (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-auto min-h-20 w-full flex-col gap-2 border-dashed bg-background/60 px-4 py-4 text-center whitespace-normal hover:bg-muted/60"
                          onClick={(event) => {
                            event.preventDefault();
                            setUploadWidgetOpen(true);
                            openUploadWidget();
                          }}
                        >
                          <span className="flex items-center gap-2 font-medium">
                            {field.value ? (
                              <ImageIcon className="size-4" />
                            ) : (
                              <Upload className="size-4" />
                            )}
                            <span className="max-w-full truncate">
                              {uploadButtonLabel}
                            </span>
                          </span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {t("fields.imageHint")}
                          </span>
                        </Button>
                      )}
                    </CldUploadWidget>
                  </FormControl>
                  <input type="hidden" name="image" value={field.value ?? ""} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-20 resize-none bg-background/80"
                      {...field}
                      placeholder={t("fields.descriptionPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {!state.ok && state.message ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{tErrors("error")}</AlertTitle>
              <AlertDescription>
                {translateMessage(tActions, state.message)}
              </AlertDescription>
            </Alert>
          ) : null}

          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="subdomain" value={subdomain} />
          <input type="hidden" name="status" value={status} />

          <div className="sticky bottom-0 z-10 -mx-4 grid grid-cols-2 gap-2 bg-background/95 px-4 pb-1 pt-3 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0">
            <Button
              type="button"
              variant="destructive"
              disabled={isPending || isDeleting}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              {tCommon("actions.delete")}
            </Button>
            <Button
              type="submit"
              disabled={isPending || isDeleting}
              className="w-full"
            >
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {t("actions.save")}
            </Button>
          </div>
        </form>
      </Form>
      <ConfirmDialog
        title={t("actions.deleteConfirmTitle")}
        description={t("actions.deleteConfirmDescription")}
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={handleDelete}
        icon={<Trash2 className="text-destructive" />}
        isPending={isDeleting}
        variant="destructive"
      />
    </ResponsiveDialogDrawer>
  );
}
