"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { toast } from "sonner";
import {
  AlertCircle,
  DollarSign,
  Flag,
  ImageIcon,
  Link2,
  Loader2,
  Minus,
  PackagePlus,
  Plus,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSubdomain } from "@/context/SubdomainContext";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { createPlannedAction } from "@/actions/plannedActions";
import { createPlannedInProjectAction } from "@/actions/projectActions";
import { useTranslations } from "next-intl";
import { ActionResult, initialState } from "@/lib/initial-action-return";
import { cn } from "@/lib/utils";
import { translateMessage } from "@/lib/translate-message";
import { AutoCreateForm } from "./dialog-auto-create";

type PlannedCreateFormProps = {
  mode?: "standalone" | "project";
  subdomain: string;
  projectId?: string;
  onCompleted?: () => void;
  onUploadWidgetOpenChange?: (isOpen: boolean) => void;
  imageSelection?: PlannedImageSelection;
  onImageSelectionChange?: (
    selection: PlannedImageSelection | undefined,
  ) => void;
  className?: string;
  submitButtonClassName?: string;
  submitLabel?: string;
  form?: UseFormReturn<PlannedCreateFormValues>;
};

const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const priorityIconClassNames: Record<(typeof priorityOptions)[number], string> =
  {
    LOW: "text-emerald-500",
    MEDIUM: "text-sky-500",
    HIGH: "text-amber-500",
    URGENT: "text-destructive",
  };

export type PlannedImageSelection =
  | { source: "ai"; url: string }
  | { source: "upload"; info: CloudinaryUploadWidgetInfo };

export type PlannedCreateFormValues = {
  title: string;
  price: string;
  quantity: string;
  status: "PENDING";
  priority: "" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  image: string;
  productUrl: string;
  description: string;
  subdomain: string;
};

export const getDefaultValues = (
  subdomain: string,
): PlannedCreateFormValues => ({
  title: "",
  price: "",
  quantity: "1",
  status: "PENDING",
  priority: "",
  image: "",
  productUrl: "",
  description: "",
  subdomain,
});

export function PlannedCreateForm({
  mode = "standalone",
  subdomain,
  projectId,
  onCompleted,
  onUploadWidgetOpenChange,
  imageSelection,
  onImageSelectionChange,
  className,
  submitButtonClassName,
  submitLabel,
  form: externalForm,
}: PlannedCreateFormProps) {
  const t = useTranslations("Planned");
  const tActions = useTranslations("ActionMessages");
  const tCommon = useTranslations("Common");
  const tErrors = useTranslations("Errors");
  const router = useRouter();
  const isProjectMode = mode === "project";

  const internalForm = useForm<PlannedCreateFormValues>({
    defaultValues: getDefaultValues(subdomain),
  });
  const form = externalForm ?? internalForm;

  const [internalImageSelection, setInternalImageSelection] = useState<
    PlannedImageSelection | undefined
  >(undefined);
  const selectedImage = onImageSelectionChange
    ? imageSelection
    : internalImageSelection;
  const setSelectedImage = onImageSelectionChange ?? setInternalImageSelection;

  const handledStateRef = useRef<ActionResult | null>(null);
  const actionHandler = isProjectMode
    ? createPlannedInProjectAction
    : createPlannedAction;
  const [state, action, isPending] = useActionState<ActionResult, FormData>(
    actionHandler,
    initialState,
  );

  useEffect(() => {
    form.reset(getDefaultValues(subdomain));
    setSelectedImage(undefined);
  }, [form, externalForm, onImageSelectionChange, setSelectedImage, subdomain]);

  useEffect(() => {
    if (!state.message || handledStateRef.current === state) return;
    handledStateRef.current = state;

    if (state.ok) {
      toast.success(translateMessage(tActions, state.message));
      form.reset(getDefaultValues(subdomain));
      setSelectedImage(undefined);
      onCompleted?.();
      router.refresh();
    } else {
      toast.error(translateMessage(tActions, state.message));
    }
  }, [form, onCompleted, router, setSelectedImage, state, subdomain, tActions]);

  const uploadButtonLabel =
    selectedImage?.source === "upload"
      ? `${t("feedback.selected")}: ${selectedImage.info.original_filename}.${selectedImage.info.format}`
      : selectedImage?.source === "ai"
        ? `${t("feedback.selected")}: ${t("ai.extractedImage")}`
        : t("uploadImage");

  return (
    <Form {...form}>
      <form action={action} className={cn("space-y-4", className)}>
        {isProjectMode ? (
          <input type="hidden" name="projectId" value={projectId ?? ""} />
        ) : null}
        <section className="rounded-lg border bg-card/80 p-4 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <PackagePlus className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-tight">
                {t("create.manualTitle")}
              </h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {t("create.manualDescription")}
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
                  <InputGroup className=" bg-background/80">
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
                  <InputGroup className=" bg-background/80">
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
                        onChange={(e) => field.onChange(e.target.value)}
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
                          // type="number"
                          min={1}
                          step={1}
                          inputMode="numeric"
                          {...field}
                          placeholder={t("fields.quantityPlaceholder")}
                          className="h-full border-0 bg-transparent text-center shadow-none focus-visible:ring-0"
                          onChange={(e) => field.onChange(e.target.value)}
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
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <span className="flex items-center gap-2">
                              <Flag
                                className={cn(
                                  "size-4",
                                  priorityIconClassNames[priority],
                                )}
                              />
                              {tCommon(`priority.${priority}`)}
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
                    onOpen={() => onUploadWidgetOpenChange?.(true)}
                    onClose={() => onUploadWidgetOpenChange?.(false)}
                    onSuccess={(result, { widget }) => {
                      const info = result.info;
                      if (!info || typeof info === "string") {
                        widget.close();
                        onUploadWidgetOpenChange?.(false);
                        return;
                      }
                      field.onChange(info.secure_url);
                      setSelectedImage({ source: "upload", info });
                      widget.close();
                      onUploadWidgetOpenChange?.(false);
                    }}
                  >
                    {({ open }) => {
                      return (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-auto min-h-20 w-full flex-col gap-2 border-dashed bg-background/60 px-4 py-4 text-center whitespace-normal hover:bg-muted/60"
                          onClick={(e) => {
                            e.preventDefault();
                            onUploadWidgetOpenChange?.(true);
                            open();
                          }}
                        >
                          <span className="flex items-center gap-2 font-medium">
                            {selectedImage ? (
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
                      );
                    }}
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
        <div>
          {!state.ok && state.message && (
            <Alert variant={"destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{tErrors("error")}</AlertTitle>
              <AlertDescription>
                {translateMessage(tActions, state.message)}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <input type="hidden" name="subdomain" value={subdomain} />
        <input type="hidden" name="status" value={"PENDING"} />
        <div className="sticky bottom-0 z-10 -mx-4 bg-background/95 px-4 pb-1 pt-3 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0">
          <Button
            type="submit"
            disabled={isPending}
            className={cn("w-full", submitButtonClassName)}
          >
            {isPending ? <Loader2 className="animate-spin" /> : null}
            {submitLabel ?? t("actions.add")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function CreatePlannedDialog({
  onUploadWidgetOpenChange,
  onCompleted,
  imageSelection,
  onImageSelectionChange,
  mode = "standalone",
  projectId,
  showAutoCreate = true,
}: {
  onUploadWidgetOpenChange?: (isOpen: boolean) => void;
  onCompleted?: () => void;
  imageSelection?: PlannedImageSelection;
  onImageSelectionChange?: (
    selection: PlannedImageSelection | undefined,
  ) => void;
  mode?: "standalone" | "project";
  projectId?: string;
  showAutoCreate?: boolean;
}) {
  const { subdomain } = useSubdomain();
  const t = useTranslations("Planned");
  const plannedForm = useForm<PlannedCreateFormValues>({
    defaultValues: getDefaultValues(subdomain),
  });

  return (
    <div className="space-y-4">
      {showAutoCreate ? (
        <>
          <AutoCreateForm
            onExtracted={({ url, product }) => {
              plannedForm.setValue("productUrl", url, {
                shouldDirty: true,
                shouldTouch: true,
              });

              if (product.name) {
                plannedForm.setValue("title", product.name, {
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }

              if (product.description) {
                plannedForm.setValue("description", product.description, {
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }

              if (product.price) {
                plannedForm.setValue("price", product.price, {
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }

              if (product.image) {
                plannedForm.setValue("image", product.image, {
                  shouldDirty: true,
                  shouldTouch: true,
                });
                onImageSelectionChange?.({
                  source: "ai",
                  url: product.image,
                });
              }
            }}
          />
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>{t("create.separator")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </>
      ) : null}
      <PlannedCreateForm
        form={plannedForm}
        mode={mode}
        projectId={projectId}
        subdomain={subdomain}
        imageSelection={imageSelection}
        onImageSelectionChange={onImageSelectionChange}
        onCompleted={onCompleted}
        onUploadWidgetOpenChange={onUploadWidgetOpenChange}
      />
    </div>
  );
}
