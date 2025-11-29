"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { toast } from "sonner";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { useSubdomain } from "@/context/SubdomainContext";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
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
import { useTranslations } from "next-intl";
import { ActionResult, initialState } from "@/util/initial-action-return";

export function CreatePlannedDialog() {
  const t = useTranslations("PlannedPage");
  const { subdomain } = useSubdomain();
  const form = useForm({
    defaultValues: {
      title: "",
      price: "",
      quantity: "",
      status: "PENDING",
      priority: "",
      image: "",
      productUrl: "",
      description: "",
      subdomain: subdomain,
    },
  });

  const [uploadedInfo, setUploadedInfo] = useState<
    string | CloudinaryUploadWidgetInfo | undefined
  >(undefined);

  const [state, action, isPending] = useActionState<ActionResult, FormData>(
    createPlannedAction,
    initialState
  );

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      form.reset();
    } else {
      toast.error(state.message);
    }
  }, [state, form]);

  return (
    <Form {...form}>
      <form action={action} className="space-y-4 pt-4">
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
        <div className="flex flex-row gap-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="flex-auto">
                <FormLabel>{t("price")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={"any"}
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
              <FormItem className="flex-1">
                <FormLabel>{t("quantity")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    {...field}
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
                  {...field}
                  options={{
                    sources: ["local", "url", "camera"],
                  }}
                  uploadPreset="test-preset"
                  onSuccess={(result, { widget }) => {
                    const info = result.info;
                    if (!info || typeof info === "string") {
                      widget.close();
                      return;
                    }
                    field.onChange(info.secure_url);
                    setUploadedInfo(info);
                    widget.close();
                  }}
                >
                  {({ open }) => {
                    return (
                      <Button
                        variant={"secondary"}
                        className="justify-between"
                        onClick={(e) => {
                          e.preventDefault();
                          open();
                        }}
                      >
                        <p>
                          {uploadedInfo && typeof uploadedInfo !== "string"
                            ? `${t("selected")}: ${uploadedInfo.original_filename}.${uploadedInfo.format}`
                            : `${t("upload-image")}`}
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
              <FormLabel>{t("link")}</FormLabel>
              <FormControl>
                <Input className="resize-none" type="url" {...field} />
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
                <Textarea className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {!state.ok && state.message && (
            <Alert variant={"destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro:</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
        </div>
        <input type="hidden" name="subdomain" value={subdomain} />
        <input type="hidden" name="status" value={"PENDING"} />
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : null}
            {t("save")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
