"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AssignPlannedDialog } from "./assign-planned-dialog";
import {
  PlannedBacklogItem,
  ProjectWithPlanned,
} from "@/app/[locale]/types/projects";
import { unassignPlannedFromProjectAction } from "@/actions/projectActions";
import { Loader2, NotepadText, X } from "lucide-react";
import { ProjectEditDialog } from "./project-edit-dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  project: ProjectWithPlanned;
  plannedBacklog: PlannedBacklogItem[];
  subdomain: string;
};

const initialState = { ok: false, message: "" };

function UnassignButton({
  plannedId,
  subdomain,
}: {
  plannedId: string;
  subdomain: string;
}) {
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

const formatPrice = (price: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(price ?? 0);

export function ProjectCard({ project, plannedBacklog, subdomain }: Props) {
  const t = useTranslations("ProjectsPage");
  const tTable = useTranslations("Table");
  const tPlanned = useTranslations("PlannedPage");
  const totalPlannedAmount = project.plannedItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
    0,
  );

  return (
    <Card className="border border-muted shadow-sm">
      <CardHeader className="flex flex-col gap-3 ">
        <div className="w-full space-y-1 ">
          <div className="flex justify-between ">
            <CardTitle className="flex items-center gap-2">
              <NotepadText className="size-5" />
              {project.name}
            </CardTitle>
            {totalPlannedAmount !== 0 && (
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-xl">
                  {formatPrice(totalPlannedAmount)}
                </span>

                <span className="text-xs text-muted-foreground">
                  {t("project.total-value")}
                </span>
              </div>
            )}
          </div>
          <CardDescription className="max-w-2xl">
            {project.description || t("project.no-description")}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.counts.total ? (
            <Badge variant="secondary">
              {t("project.badges.total", { count: project.counts.total })}
            </Badge>
          ) : null}
          {project.counts.pending ? (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              {t("project.badges.pending", { count: project.counts.pending })}
            </Badge>
          ) : null}
          {project.counts.purchased ? (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              {t("project.badges.purchased", {
                count: project.counts.purchased,
              })}
            </Badge>
          ) : null}
          {project.counts.purchased ? (
            <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">
              {t("project.badges.cancelled", {
                count: project.counts.cancelled,
              })}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {project.plannedItems.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {t("project.empty")}
          </p>
        ) : (
          <>
            {project.plannedItems.map((item) => (
              <Item
                key={item.id}
                variant="outline"
                className="space-y-3 bg-background"
              >
                <ItemMedia variant={"image"}>
                  {item.image ? (
                    <Image
                      className="aspect-square"
                      width={50}
                      height={50}
                      src={item.image}
                      alt={item.title}
                    />
                  ) : (
                    <Avatar>
                      <AvatarFallback className="bg-muted text-muted-foreground flex items-center justify-center">
                        {item.title.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </ItemMedia>
                <ItemContent className="gap-0">
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription className="text-sm">
                    {formatPrice(item.price)}{" "}
                    <span className="text-muted-foreground">
                      x{item.quantity}
                    </span>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {tTable(`status.${item.status}`)}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {tPlanned(`priority-options.${item.priority}`)}
                    </Badge>
                  </div>
                  <UnassignButton plannedId={item.id} subdomain={subdomain} />
                </ItemActions>
              </Item>
            ))}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <div className="flex-1 justify-between">
          <AssignPlannedDialog
            projectId={project.id}
            projectName={project.name}
            plannedBacklog={plannedBacklog}
            subdomain={subdomain}
          />
          {/* <CreatePlannedDialogTrigger /> */}
        </div>
        <ProjectEditDialog project={project} />
        <Button asChild variant="secondary" size="sm">
          <Link href="/planned">{t("project.open-planned")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
