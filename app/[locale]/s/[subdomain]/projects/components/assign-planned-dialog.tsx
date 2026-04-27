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
import { formatPriceYen } from "@/lib/formatPriceYen";
import { initialState } from "@/lib/initial-action-return";
import { translateMessage } from "@/lib/translate-message";

type Props = {
  projectId: string;
  projectName: string;
  plannedBacklog: PlannedBacklogItem[];
  subdomain: string;
};

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
    initialState,
  );
  const router = useRouter();
  const t = useTranslations("Projects");
  const tActions = useTranslations("ActionMessages");
  const tCommon = useTranslations("Common");
  const handledStateRef = useRef<typeof state | null>(null);

  const selectedItem = useMemo(
    () => plannedBacklog.find((item) => item.id === selectedId),
    [plannedBacklog, selectedId],
  );

  useEffect(() => {
    if (!state || handledStateRef.current === state) return;
    handledStateRef.current = state;

    if (state.ok) {
      toast.success(t("toast.assigned", { projectName }));
      setSelectedId("");
      setOpen(false);
      router.refresh();
    } else if (state.message) {
      toast.error(translateMessage(tActions, state.message));
    }
  }, [projectName, router, state, t, tActions]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className=""
          disabled={plannedBacklog.length === 0}
        >
          <Plus className="h-4 w-4" />
          {t("assign.cta")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[70vh] w-[calc(100vw-2rem)] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("assign.title", { projectName })}</DialogTitle>
          <DialogDescription>{t("assign.description")}</DialogDescription>
        </DialogHeader>
        {plannedBacklog.length === 0 ? (
          <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            {t("assign.empty")}
          </p>
        ) : (
          <div className="min-w-0 space-y-4 overflow-hidden">
            <Command className="min-w-0 rounded-lg border shadow-none">
              <CommandInput placeholder={t("assign.searchPlaceholder")} />
              <CommandList className="max-h-60 min-w-0">
                <CommandEmpty>{t("assign.noResults")}</CommandEmpty>
                <CommandGroup>
                  {plannedBacklog.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.title}
                      className="min-w-0 flex-wrap items-start gap-2 sm:flex-nowrap sm:items-center sm:gap-3"
                      onSelect={() => setSelectedId(item.id)}
                    >
                      <div className="flex min-w-0 flex-[1_1_14rem] flex-col">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="min-w-0 flex-1 basis-32 truncate font-medium">
                            {item.title}
                          </span>
                          <Badge
                            variant="outline"
                            className="max-w-full text-[10px]"
                          >
                            {tCommon(`status.${item.status}`)}
                          </Badge>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {tCommon(`priority.${item.priority}`)}
                        </p>
                      </div>
                      <Separator
                        orientation="vertical"
                        className="hidden h-8 bg-border sm:block"
                      />
                      <Badge
                        variant="secondary"
                        className="max-w-full truncate"
                      >
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
                <span className="min-w-0 truncate">
                  {selectedItem
                    ? t("assign.submitSelected", {
                        title: selectedItem.title,
                      })
                    : t("assign.submit")}
                </span>
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
