"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { oldestPlannedItemsType } from "../HomeContent";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { CldImage } from "next-cloudinary";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

const PLANNED_PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/dsttcre2h/image/upload/v1751870559/placeholder_dtzhrr.png";

dayjs.extend(relativeTime);

export function TimeToTakeAction({
  items,
}: {
  items: oldestPlannedItemsType;
}) {
  const t = useTranslations("DashboardHome");
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <p className="mb-2 text-sm">{t("timeToTakeAction")}</p>
      <ScrollArea className="w-full max-w-full min-w-0">
        <div className="flex gap-3 pb-3">
          {items.map((item) => {
            return (
              <Card
                key={item.id}
                className="w-56 md:w-69 shrink-0 overflow-hidden p-0 shadow-sm"
              >
                <Link
                  href={{
                    pathname: "/planned",
                    query: { title: item.title, showAll: "1" },
                  }}
                  aria-label={t("openItem", { title: item.title })}
                >
                  <div className="relative">
                    <Badge
                      variant="secondary"
                      className="absolute top-2 left-2"
                    >
                      {dayjs(item.createdAt).fromNow()}
                    </Badge>
                    <CldImage
                      width={500}
                      height={500}
                      src={item.image || PLANNED_PLACEHOLDER_IMAGE}
                      alt={item.title}
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-2">
                    <p className="line-clamp-2 text-sm font-medium">
                      {item.title}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
