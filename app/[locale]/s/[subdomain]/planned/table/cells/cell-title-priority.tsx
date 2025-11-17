import React from "react";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, Link as LucidLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { useTranslations } from "next-intl";
import { priorities } from "@/data/data";

function TitleCell({ row }: { row: Row<PlannedSchema> }) {
  const t = useTranslations("PlannedPage");
  const { title, priority, productUrl } = row.original;

  const tPriorities = React.useMemo(
    () =>
      priorities.map((p) => ({
        value: p.value,
        label: t(`priority-options.${p.value}`),
        icon: p.icon,
      })),
    [t]
  );

  const match = tPriorities.find((p) => p.value === priority);
  const Icon = match?.icon as LucideIcon | undefined;

  return (
    <div className="flex justify-between pt-4 px-4 text-foreground">
      <p className="text-lg font-semibold">{title}</p>
      <div className=" flex flex-row items-start h-fit gap-2">
        {productUrl ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Badge variant={"outline"}>
                <LucidLink strokeWidth={2} className="text-foreground" />
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-69" side="bottom" align="end">
              <DropdownMenuItem>
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline line-clamp-3 break-all"
                >
                  {productUrl}
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <Badge
          variant={"outline"}
          className={`${
            priority === "HIGH" || priority === "URGENT"
              ? "text-destructive border-destructive"
              : null
          }`}
        >
          {Icon ? <Icon className="mr-1 h-4 w-4" /> : null}
          {match?.label ?? priority}
        </Badge>
      </div>
    </div>
  );
}

export default TitleCell;
