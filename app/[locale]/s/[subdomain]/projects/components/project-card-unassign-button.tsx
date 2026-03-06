"use client";

import { unassignPlannedFromProjectAction } from "@/actions/projectActions";
import { Button } from "@/components/ui/button";
import { initialState } from "@/util/initial-action-return";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

type Props = {
  plannedId: string;
  subdomain: string;
};

export function ProjectCardUnassignButton({ plannedId, subdomain }: Props) {
  const t = useTranslations("ProjectsPage");
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    unassignPlannedFromProjectAction,
    initialState,
  );

  useEffect(() => {
    if (!state) return;

    if (state.ok) {
      toast.success(t("toast-unassigned"));
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [router, state, t]);

  return (
    <form action={formAction}>
      <input type="hidden" name="plannedId" value={plannedId} />
      <input type="hidden" name="subdomain" value={subdomain} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
