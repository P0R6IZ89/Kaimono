"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Home, Layers, Plus, ShoppingCart, Sofa } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { stripLeadingLocale } from "@/middleware";
import { useTranslations } from "next-intl";
import { CreateEssentialDialogTrigger } from "@/app/[locale]/s/[subdomain]/essentialsOld/dialogs/dialog-create-trigger";
import { CreatePlannedDialogTrigger } from "@/app/[locale]/s/[subdomain]/planned/dialogs/dialog-create-trigger";
import { ProjectCreateDialog } from "@/app/[locale]/s/[subdomain]/projects/components/project-create-dialog";
import { RadialItem, RadialPieMenu } from "./quick-action-pie-menu";
import { Button } from "../ui/button";

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";
  const { rest } = stripLeadingLocale(pathname);
  const t = useTranslations("MobileNav");
  const essentialTriggerRef = useRef<HTMLButtonElement>(null);
  const plannedTriggerRef = useRef<HTMLButtonElement>(null);
  const projectTriggerRef = useRef<HTMLButtonElement>(null);

  const items = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/projects", label: t("projects"), icon: Layers },
    { href: "/essentials", label: t("essentials"), icon: ShoppingCart },
    // { href: "/settings", label: t("settings"), icon: Settings },
  ];

  const itemsMenu: RadialItem[] = [
    {
      id: "essential",
      label: "essential",
      icon: ShoppingCart,
      onSelect: () => essentialTriggerRef.current?.click(),
    },
    {
      id: "planned",
      label: "planned",
      icon: Sofa,
      onSelect: () => plannedTriggerRef.current?.click(),
    },
    {
      id: "project",
      label: "project",
      icon: Layers,
      onSelect: () => projectTriggerRef.current?.click(),
    },
  ];

  return (
    <nav
      aria-label="Bottom navigation"
      suppressHydrationWarning
      className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-transparent px-2"
    >
      <CreateEssentialDialogTrigger
        className="hidden"
        triggerRef={essentialTriggerRef}
      />
      <CreatePlannedDialogTrigger
        className="hidden"
        triggerRef={plannedTriggerRef}
      />
      <ProjectCreateDialog className="hidden" triggerRef={projectTriggerRef} />
      <div className="flex gap-2 items-center w-full pb-[calc(env(safe-area-inset-bottom))] ">
        <div className="flex-1 rounded-2xl border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
          <ul className="grid grid-cols-3 items-center">
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
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex justify-center items-center rounded-full border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
          <RadialPieMenu
            asChild
            items={itemsMenu}
            radius={120}
            itemSize={48}
            startAngleCW={(3 * Math.PI) / 2} // 9 o’clock
            sweepAngleCW={Math.PI / 2} // to 12 o’clock
          >
            <div className="py-4 px-4">
              <Button
                variant="ghost"
                size="icon"
                className="flex flex-col items-center justify-center gap-1"
              >
                <Plus className="size-4" />
                <span className="text-xs">Add</span>
              </Button>
            </div>
          </RadialPieMenu>
        </div>
      </div>
    </nav>
  );
}
