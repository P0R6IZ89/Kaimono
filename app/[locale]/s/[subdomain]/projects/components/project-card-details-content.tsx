"use client";

import { ProjectWithPlanned } from "@/app/[locale]/types/projects";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ProjectCardUnassignButton } from "./project-card-unassign-button";

type Props = {
  project: ProjectWithPlanned;
  subdomain: string;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(price ?? 0);

export function ProjectCardDetailsContent({ project, subdomain }: Props) {
  const t = useTranslations("Projects");
  const tCommon = useTranslations("Common");

  const getPlannedHref = (title: string) => ({
    pathname: "/planned" as const,
    query: {
      title,
      showAll: "1",
    },
  });

  return (
    <div className="space-y-4">
      {project.plannedItems.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          {t("project.empty")}
        </p>
      ) : (
        <div className="space-y-3">
          {project.plannedItems.map((item) => (
            <Link
              key={item.id}
              href={getPlannedHref(item.title)}
              aria-label={`${t("project.openPlanned")}: ${item.title}`}
              className="-m-2 flex min-w-0 flex-1 items-center gap-3.5 rounded-md p-2 outline-none transition-colors hover:bg-muted/70 focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <Item
                key={item.id}
                variant="outline"
                className="space-y-3 bg-background z-10"
              >
                <ItemMedia variant="image">
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
                      {tCommon(`status.${item.status}`)}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {tCommon(`priority.${item.priority}`)}
                    </Badge>
                  </div>
                  <ProjectCardUnassignButton
                    plannedId={item.id}
                    subdomain={subdomain}
                  />
                </ItemActions>
              </Item>
            </Link>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button asChild variant="secondary" size="sm">
          <Link href="/planned">{t("project.openPlanned")}</Link>
        </Button>
      </div>
    </div>
  );
}
