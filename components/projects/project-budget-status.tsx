"use client";

import { formatPriceYen } from "@/lib/formatPriceYen";
import {
  getProjectBudgetSummary,
  ProjectBudgetItem,
} from "@/lib/project-budget";
import { cn } from "@/lib/utils";
import { WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

type ProjectBudgetStatusProps = {
  budget: number | null;
  items: ProjectBudgetItem[];
  className?: string;
  action?: ReactNode;
};

const stateClasses = {
  within: {
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  "at-limit": {
    text: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  over: {
    text: "text-destructive",
    bar: "bg-destructive",
  },
} as const;

export function ProjectBudgetStatus({
  budget,
  items,
  className,
  action,
}: ProjectBudgetStatusProps) {
  const t = useTranslations("Projects.project.budget");
  const summary = getProjectBudgetSummary(budget, items);

  if (summary.state === "unset") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-dashed p-3",
          className,
        )}
      >
        <WalletCards className="size-5 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{t("title")}</p>
          <p className="text-xs text-muted-foreground">{t("notSet")}</p>
        </div>
        {action && <div className="self-end">{action}</div>}
      </div>
    );
  }

  const colors = stateClasses[summary.state];
  const visualPercentage = Math.min(summary.percentage, 100);
  const roundedPercentage = Math.round(summary.percentage);
  const statusText =
    summary.state === "over"
      ? t("overBy", { amount: formatPriceYen(summary.overage) })
      : summary.state === "at-limit"
        ? t("atLimit")
        : t("remaining", { amount: formatPriceYen(summary.remaining) });

  return (
    <div className={cn("space-y-2.5 rounded-lg border p-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{t("title")}</p>
          <p className="text-xs text-muted-foreground">
            {t("usedOfBudget", {
              used: formatPriceYen(summary.activeTotal),
              budget: formatPriceYen(summary.budget ?? 0),
            })}
          </p>
        </div>
        <span className={cn("text-sm font-semibold", colors.text)}>
          {t("percentage", { percentage: roundedPercentage })}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={t("title")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(visualPercentage)}
        aria-valuetext={`${roundedPercentage}%. ${statusText}`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-[width]", colors.bar)}
          style={{ width: `${visualPercentage}%` }}
        />
      </div>

      <div className="flex items-end justify-between gap-3">
        <p className={cn("text-xs font-medium", colors.text)}>{statusText}</p>
        {action}
      </div>
    </div>
  );
}
