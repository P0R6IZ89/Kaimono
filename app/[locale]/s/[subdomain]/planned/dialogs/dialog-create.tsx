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
import { ActionResult, initialState } from "@/util/initial-action-return";
import { cn } from "@/lib/utils";

type PlannedCreateFormProps = {
  mode?: "standalone" | "project";
  subdomain: string;
  projectId?: string;
  onCompleted?: () => void;
  onUploadWidgetOpenChange?: (isOpen: boolean) => void;
  className?: string;
  submitButtonClassName?: string;
  submitLabel?: string;
  form?: UseFormReturn<PlannedCreateFormValues>;
};

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

  const [uploadedInfo, setUploadedInfo] = useState<
    string | CloudinaryUploadWidgetInfo | undefined
  >(undefined);

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
    setUploadedInfo(undefined);
  }, [form, externalForm, subdomain]);

  useEffect(() => {
    if (!state.message || handledStateRef.current === state) return;
    handledStateRef.current = state;

    if (state.ok) {
      toast.success(state.message);
      form.reset(getDefaultValues(subdomain));
      setUploadedInfo(undefined);
      onCompleted?.();
      router.refresh();
    } else {
      toast.error(state.message);
    }
  }, [form, onCompleted, router, state, subdomain]);

  return (
    <Form {...form}>
      <form action={action} className={cn("space-y-4 pt-4", className)}>
        {isProjectMode ? (
          <input type="hidden" name="projectId" value={projectId ?? ""} />
        ) : null}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.itemName")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("fields.itemNamePlaceholder")}
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
                    placeholder={t("fields.pricePlaceholder")}
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
                    placeholder={t("fields.quantityPlaceholder")}
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
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("fields.priorityPlaceholder")}
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
                    setUploadedInfo(info);
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
                        <p>
                          {uploadedInfo && typeof uploadedInfo !== "string"
                            ? `${t("feedback.selected")}: ${uploadedInfo.original_filename}.${uploadedInfo.format}`
                            : `${t("uploadImage")}`}
                        </p>
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
}: {
  onUploadWidgetOpenChange?: (isOpen: boolean) => void;
  onCompleted?: () => void;
}) {
  const { subdomain } = useSubdomain();

  return (
    <PlannedCreateForm
      subdomain={subdomain}
      onCompleted={onCompleted}
      onUploadWidgetOpenChange={onUploadWidgetOpenChange}
    />
  );
}
