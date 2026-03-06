"use client";

import {
  attachPlannedToProjectAction,
  createPlannedInProjectAction,
} from "@/actions/projectActions";
import { PlannedBacklogItem } from "@/app/[locale]/types/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPriceYen } from "@/util/formatPriceYen";
import { initialState } from "@/util/initial-action-return";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Upload } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  projectId: string;
  projectName: string;
  subdomain: string;
  plannedBacklog: PlannedBacklogItem[];
  onCompleted: () => void;
  onUploadWidgetOpenChange: (isOpen: boolean) => void;
};

export function ProjectCardAddTabsContent({
  projectId,
  projectName,
  subdomain,
  plannedBacklog,
  onCompleted,
  onUploadWidgetOpenChange,
}: Props) {
  const t = useTranslations("ProjectsPage");
  const tTable = useTranslations("Table");
  const tPlanned = useTranslations("PlannedPage");
  const router = useRouter();

  const [addTab, setAddTab] = useState<"assign" | "add-new">("assign");
  const [selectedId, setSelectedId] = useState("");
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  >("MEDIUM");
  const [image, setImage] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<
    string | CloudinaryUploadWidgetInfo | undefined
  >(undefined);

  const [assignState, assignAction, assignPending] = useActionState(
    attachPlannedToProjectAction,
    initialState,
  );
  const [createState, createAction, createPending] = useActionState(
    createPlannedInProjectAction,
    initialState,
  );

  const handledAssignStateRef = useRef<typeof assignState | null>(null);
  const handledCreateStateRef = useRef<typeof createState | null>(null);
  const createFormRef = useRef<HTMLFormElement>(null);

  const selectedItem = useMemo(
    () => plannedBacklog.find((item) => item.id === selectedId),
    [plannedBacklog, selectedId],
  );

  useEffect(() => {
    if (!assignState || handledAssignStateRef.current === assignState) return;
    handledAssignStateRef.current = assignState;

    if (assignState.ok) {
      toast.success(t("toast-assigned", { projectName }));
      setSelectedId("");
      setAddTab("assign");
      onCompleted();
      router.refresh();
    } else if (assignState.message) {
      toast.error(assignState.message);
    }
  }, [assignState, onCompleted, projectName, router, t]);

  useEffect(() => {
    if (!createState || handledCreateStateRef.current === createState) return;
    handledCreateStateRef.current = createState;

    if (createState.ok) {
      toast.success(t("toast-planned-created"));
      setAddTab("assign");
      setPriority("MEDIUM");
      setImage("");
      setUploadedInfo(undefined);
      createFormRef.current?.reset();
      onCompleted();
      router.refresh();
    } else if (createState.message) {
      toast.error(createState.message);
    }
  }, [createState, onCompleted, router, t]);

  return (
    <Tabs
      value={addTab}
      onValueChange={(value) => setAddTab(value as "assign" | "add-new")}
      className="w-full h-fit"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="assign">{t("add.tabs.assign")}</TabsTrigger>
        <TabsTrigger value="add-new">{t("add.tabs.add-new")}</TabsTrigger>
      </TabsList>

      <TabsContent value="assign" className="mt-4 space-y-4">
        {plannedBacklog.length === 0 ? (
          <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            {t("assign.empty")}
          </p>
        ) : (
          <>
            <Command className="rounded-lg border shadow-none">
              <CommandInput placeholder={t("assign.search-placeholder")} />
              <CommandList className="max-h-60">
                <CommandEmpty>{t("assign.no-results")}</CommandEmpty>
                <CommandGroup>
                  {plannedBacklog.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.title}
                      className="flex items-center gap-3"
                      onSelect={() => setSelectedId(item.id)}
                    >
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {item.title}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {tTable(`status.${item.status}`)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tPlanned(`priority-options.${item.priority}`)}
                        </p>
                      </div>
                      <Separator
                        orientation="vertical"
                        className="h-8 bg-border"
                      />
                      <Badge variant="secondary">
                        {formatPriceYen(item.price * item.quantity)}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>

            <form action={assignAction} className="flex items-center gap-2">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="plannedId" value={selectedId} />
              <input type="hidden" name="subdomain" value={subdomain} />
              <Button
                type="submit"
                disabled={!selectedId || assignPending}
                className="w-full"
              >
                {assignPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {selectedItem
                  ? t("assign.submit-selected", {
                      title: selectedItem.title,
                    })
                  : t("assign.submit")}
              </Button>
            </form>
          </>
        )}
      </TabsContent>

      <TabsContent value="add-new" className="mt-4">
        <form ref={createFormRef} action={createAction} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="subdomain" value={subdomain} />
          <input type="hidden" name="priority" value={priority} />
          <input type="hidden" name="image" value={image} />

          <div className="space-y-2">
            <label
              htmlFor={`title-${projectId}`}
              className="text-sm font-medium"
            >
              {tPlanned("item-name")}
            </label>
            <Input
              id={`title-${projectId}`}
              name="title"
              placeholder={tPlanned("item-name-placeholder")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label
                htmlFor={`price-${projectId}`}
                className="text-sm font-medium"
              >
                {tPlanned("price")}
              </label>
              <Input
                id={`price-${projectId}`}
                name="price"
                type="number"
                min={0}
                step="any"
                placeholder={tPlanned("price-placeholder")}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor={`quantity-${projectId}`}
                className="text-sm font-medium"
              >
                {tPlanned("quantity")}
              </label>
              <Input
                id={`quantity-${projectId}`}
                name="quantity"
                type="number"
                min={1}
                step={1}
                placeholder={tPlanned("quantity-placeholder")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {tPlanned("priority")}
            </label>
            <Select
              value={priority}
              onValueChange={(value) =>
                setPriority(value as "LOW" | "MEDIUM" | "HIGH" | "URGENT")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={tPlanned("select-priority")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">
                  {tPlanned("priority-options.LOW")}
                </SelectItem>
                <SelectItem value="MEDIUM">
                  {tPlanned("priority-options.MEDIUM")}
                </SelectItem>
                <SelectItem value="HIGH">
                  {tPlanned("priority-options.HIGH")}
                </SelectItem>
                <SelectItem value="URGENT">
                  {tPlanned("priority-options.URGENT")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("add.new.upload-image")}
            </label>
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
                setImage(info.secure_url);
                setUploadedInfo(info);
                widget.close();
                onUploadWidgetOpenChange?.(false);
              }}
            >
              {({ open }) => (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-between"
                  onClick={(e) => {
                    e.preventDefault();
                    onUploadWidgetOpenChange?.(true);
                    open();
                  }}
                >
                  <span>
                    {uploadedInfo && typeof uploadedInfo !== "string"
                      ? `${tPlanned("selected")}: ${uploadedInfo.original_filename}.${uploadedInfo.format}`
                      : t("add.new.upload-image")}
                  </span>
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </CldUploadWidget>
          </div>

          {!createState.ok && createState.message ? (
            <p className="text-sm text-destructive">{createState.message}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={createPending}>
            {createPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {t("add.new.submit")}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
