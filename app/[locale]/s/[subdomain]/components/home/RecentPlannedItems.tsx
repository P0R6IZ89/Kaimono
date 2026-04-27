"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link } from "@/i18n/navigation";
import { CldImage } from "next-cloudinary";
import { recentlyAddedType } from "../HomeContent";
import { useTranslations } from "next-intl";

const PLANNED_PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/dsttcre2h/image/upload/v1751870559/placeholder_dtzhrr.png";

export function RecentPlannedItems({ items }: { items: recentlyAddedType }) {
  const t = useTranslations("DashboardHome");
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="">
      <p className="mb-4 text-sm">{t("recentlyAdded")}</p>
      <ScrollArea className="w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex gap-3 pb-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="w-36 shrink-0 overflow-hidden p-0 shadow-sm"
            >
              <Link
                href={{
                  pathname: "/planned",
                  query: { title: item.title, showAll: "1" },
                }}
                aria-label={t("openItem", { title: item.title })}
              >
                <CldImage
                  width={320}
                  height={320}
                  src={item.image || PLANNED_PLACEHOLDER_IMAGE}
                  alt={item.title}
                  className="aspect-square w-full object-cover"
                />
                <CardContent className="p-2">
                  <p className="line-clamp-2 text-sm font-medium">
                    {item.title}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
