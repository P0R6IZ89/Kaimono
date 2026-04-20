"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { toast } from "sonner";
import { AlertCircle, Loader2, Upload } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createPlannedAction } from "@/actions/plannedActions";
import { createPlannedInProjectAction } from "@/actions/projectActions";
import { useTranslations } from "next-intl";
import { ActionResult, initialState } from "@/lib/initial-action-return";
import { cn } from "@/lib/utils";
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
  quantity: "",
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
      toast.success(state.message);
      form.reset(getDefaultValues(subdomain));
      setSelectedImage(undefined);
      onCompleted?.();
      router.refresh();
    } else {
      toast.error(state.message);
    }
  }, [form, onCompleted, router, setSelectedImage, state, subdomain]);

  const uploadButtonLabel =
    selectedImage?.source === "upload"
      ? `${t("feedback.selected")}: ${selectedImage.info.original_filename}.${selectedImage.info.format}`
      : selectedImage?.source === "ai"
        ? `${t("feedback.selected")}: Extracted Image`
        : t("uploadImage");

  return (
    <Form {...form}>
      <form action={action} className={cn("space-y-2 pt-4", className)}>
        {isProjectMode ? (
          <input type="hidden" name="projectId" value={projectId ?? ""} />
        ) : null}
        <FormField
          control={form.control}
          name="productUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.link")}</FormLabel>
              <FormControl>
                <Input
                  className="resize-none"
                  type="url"
                  {...field}
                  placeholder={t("fields.linkPlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.itemName")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  // placeholder={t("fields.itemNamePlaceholder")}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row gap-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="flex-auto">
                <FormLabel>{t("fields.price")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={"any"}
                    {...field}
                    // placeholder={t("fields.pricePlaceholder")}
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
              <FormItem className="flex-1">
                <FormLabel>{t("fields.quantity")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    {...field}
                    // placeholder={t("fields.quantityPlaceholder")}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.priority")}</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue
                    // placeholder={t("fields.priorityPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="LOW">
                        {tCommon("priority.LOW")}
                      </SelectItem>
                      <SelectItem value="MEDIUM">
                        {tCommon("priority.MEDIUM")}
                      </SelectItem>
                      <SelectItem value="HIGH">
                        {tCommon("priority.HIGH")}
                      </SelectItem>
                      <SelectItem value="URGENT">
                        {tCommon("priority.URGENT")}
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
            <FormItem>
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
                        variant={"secondary"}
                        className="justify-between"
                        onClick={(e) => {
                          e.preventDefault();
                          onUploadWidgetOpenChange?.(true);
                          open();
                        }}
                      >
                        <p>{uploadButtonLabel}</p>
                        <Upload />
                      </Button>
                    );
                  }}
                </CldUploadWidget>
              </FormControl>
              <input type="hidden" name="image" value={field.value ?? ""} />
              <FormDescription />
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
                  className="resize-none"
                  {...field}
                  placeholder={t("fields.descriptionPlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {!state.ok && state.message && (
            <Alert variant={"destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{tErrors("error")}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
        </div>
        <input type="hidden" name="subdomain" value={subdomain} />
        <input type="hidden" name="status" value={"PENDING"} />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className={cn(isProjectMode && "w-full", submitButtonClassName)}
          >
            {isPending ? <Loader2 className="animate-spin" /> : null}
            {submitLabel ?? t("actions.save")}
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
  const plannedForm = useForm<PlannedCreateFormValues>({
    defaultValues: getDefaultValues(subdomain),
  });

  return (
    <div>
      {showAutoCreate ? (
        <div className="bg-card rounded-md border p-2 lg:p-3">
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
        </div>
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
