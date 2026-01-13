"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { attachPlannedToProjectAction } from "@/actions/projectActions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus } from "lucide-react";
import { PlannedBacklogItem } from "@/app/[locale]/types/projects";
import { formatPriceYen } from "@/util/formatPriceYen";

type Props = {
  projectId: string;
  projectName: string;
  plannedBacklog: PlannedBacklogItem[];
  subdomain: string;
};

const initialState = { ok: false, message: "" };

export function AssignPlannedDialog({
  projectId,
  projectName,
  plannedBacklog,
  subdomain,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [state, formAction, isPending] = useActionState(
    attachPlannedToProjectAction,
    initialState
  );
  const router = useRouter();
  const t = useTranslations("ProjectsPage");
  const tTable = useTranslations("Table");
  const tPlanned = useTranslations("PlannedPage");
  const handledStateRef = useRef<typeof state | null>(null);

  const selectedItem = useMemo(
    () => plannedBacklog.find((item) => item.id === selectedId),
    [plannedBacklog, selectedId]
  );

  useEffect(() => {
    if (!state || handledStateRef.current === state) return;
    handledStateRef.current = state;

    if (state.ok) {
      toast.success(t("toast-assigned", { projectName }));
      setSelectedId("");
      setOpen(false);
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [projectName, router, state, t]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          disabled={plannedBacklog.length === 0}
        >
          <Plus className="h-4 w-4" />
          {t("assign.cta")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("assign.title", { projectName })}</DialogTitle>
          <DialogDescription>{t("assign.description")}</DialogDescription>
        </DialogHeader>
        {plannedBacklog.length === 0 ? (
          <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            {t("assign.empty")}
          </p>
        ) : (
          <div className="space-y-4 h-fit">
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

            <form action={formAction} className="flex items-center gap-2">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="plannedId" value={selectedId} />
              <input type="hidden" name="subdomain" value={subdomain} />
              <Button
                type="submit"
                disabled={!selectedId || isPending}
                className="w-full"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {selectedItem
                  ? t("assign.submit-selected", {
                      title: selectedItem.title,
                    })
                  : t("assign.submit")}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
