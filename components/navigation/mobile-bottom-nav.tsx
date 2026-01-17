"use client";

import { usePathname } from "next/navigation";
import {
  Folder,
  Home,
  Layers,
  Plus,
  Settings,
  ShoppingCart,
  Sofa,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { stripLeadingLocale } from "@/middleware";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { RadialItem, RadialPieMenu } from "./quick-action-pie-menu";

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";
  const { rest } = stripLeadingLocale(pathname);
  const t = useTranslations("MobileNav");

  const items = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/projects", label: t("projects"), icon: Folder },
    { href: "/settings", label: t("settings"), icon: Settings },
  ];

  const itemsMenu: RadialItem[] = [
    {
      id: "essential",
      label: "essential",
      icon: ShoppingCart,
      onSelect: () => toast("essential"),
    },
    {
      id: "planned",
      label: "planned",
      icon: Sofa,
      onSelect: () => toast("planned"),
    },
    {
      id: "project",
      label: "project",
      icon: Layers,
      onSelect: () => toast("project"),
    },
  ];

  return (
    <nav
      aria-label="Bottom navigation"
      suppressHydrationWarning
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden bg-transparent px-4 pt-3"
    >
      <div className="flex gap-6 items-center justify-around mx-auto max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] ">
        <div className="flex-1 rounded-2xl border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
          <ul className="flex flex-row justify-between">
            {items.map((item) => {
              const active =
                rest === item.href || rest.startsWith(item.href + "/");

              const Icon = item.icon;

              return (
                <li key={item.href} className="p-2 flex-1">
                  <Link
                    prefetch={true}
                    href={item.href}
                    aria-current={"page"}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-3 text-xs rounded-2xl transition-colors",
                      active
                        ? "text-background dark:text-foreground font-semibold bg-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-full border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
          <RadialPieMenu
            asChild
            items={itemsMenu}
            radius={120}
            itemSize={48}
            startAngleCW={(3 * Math.PI) / 2} // 9 o’clock
            sweepAngleCW={Math.PI / 2} // to 12 o’clock
          >
            <Button variant="ghost" size="icon" className="m-3">
              <Plus />
            </Button>
          </RadialPieMenu>
        </div>
      </div>
    </nav>
  );
}
