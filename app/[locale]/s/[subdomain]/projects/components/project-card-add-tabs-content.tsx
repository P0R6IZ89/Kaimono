"use client";

import { attachPlannedToProjectAction } from "@/actions/projectActions";
import { PlannedBacklogItem } from "@/app/[locale]/types/projects";
import {
  getDefaultValues,
  PlannedCreateForm,
  type PlannedCreateFormValues,
} from "@/app/[locale]/s/[subdomain]/planned/dialogs/dialog-create";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPriceYen } from "@/util/formatPriceYen";
import { initialState } from "@/util/initial-action-return";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AutoCreateForm } from "../../planned/dialogs/dialog-auto-create";

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
  const t = useTranslations("Projects");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const plannedForm = useForm<PlannedCreateFormValues>({
    defaultValues: getDefaultValues(subdomain),
  });

  const [addTab, setAddTab] = useState<"assign" | "add-new">("add-new");
  const [selectedId, setSelectedId] = useState("");

  const [assignState, assignAction, assignPending] = useActionState(
    attachPlannedToProjectAction,
    initialState,
  );

  const handledAssignStateRef = useRef<typeof assignState | null>(null);

  const selectedItem = useMemo(
    () => plannedBacklog.find((item) => item.id === selectedId),
    [plannedBacklog, selectedId],
  );

  useEffect(() => {
    if (!assignState || handledAssignStateRef.current === assignState) return;
    handledAssignStateRef.current = assignState;

    if (assignState.ok) {
      toast.success(t("toast.assigned", { projectName }));
      setSelectedId("");
      setAddTab("assign");
      onCompleted();
      router.refresh();
    } else if (assignState.message) {
      toast.error(assignState.message);
    }
  }, [assignState, onCompleted, projectName, router, t]);

  useEffect(() => {
    plannedForm.reset(getDefaultValues(subdomain));
  }, [plannedForm, subdomain]);

  return (
    <Tabs
      value={addTab}
      onValueChange={(value) => setAddTab(value as "add-new" | "assign")}
      className="w-full h-fit"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="add-new">{t("add.tabs.addNew")}</TabsTrigger>
        <TabsTrigger value="assign">{t("add.tabs.assign")}</TabsTrigger>
      </TabsList>

      <TabsContent value="assign" className="mt-4 space-y-4">
        {plannedBacklog.length === 0 ? (
          <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            {t("assign.empty")}
          </p>
        ) : (
          <>
            <Command className="rounded-lg border shadow-none">
              <CommandInput placeholder={t("assign.searchPlaceholder")} />
              <CommandList className="max-h-60">
                <CommandEmpty>{t("assign.noResults")}</CommandEmpty>
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
                            {tCommon(`status.${item.status}`)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tCommon(`priority.${item.priority}`)}
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
                  ? t("assign.submitSelected", {
                      title: selectedItem.title,
                    })
                  : t("assign.submit")}
              </Button>
            </form>
          </>
        )}
      </TabsContent>

      <TabsContent value="add-new" className="mt-4 space-y-2">
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
          }}
        />
        <PlannedCreateForm
          form={plannedForm}
          mode="project"
          projectId={projectId}
          subdomain={subdomain}
          onCompleted={() => {
            setAddTab("assign");
            onCompleted();
          }}
          onUploadWidgetOpenChange={onUploadWidgetOpenChange}
          submitLabel={t("add.new.submit")}
          submitButtonClassName="w-full"
        />
      </TabsContent>
    </Tabs>
  );
}
