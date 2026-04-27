"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Home, Layers, ShoppingCart, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { stripLeadingLocale } from "@/middleware";
import { useTranslations } from "next-intl";
import { CreateEssentialDialogTrigger } from "@/app/[locale]/s/[subdomain]/essentials/dialogs/dialog-create-trigger";
import { CreatePlannedDialogTrigger } from "@/app/[locale]/s/[subdomain]/planned/dialogs/dialog-create-trigger";
import { ProjectCreateDialog } from "@/app/[locale]/s/[subdomain]/projects/components/project-create-dialog";
import Image from "next/image";

type NavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
  imageSrc?: string | null;
};

type MobileBottomNavProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function MobileBottomNav({ user }: MobileBottomNavProps) {
  const pathname = usePathname() ?? "";
  const { rest } = stripLeadingLocale(pathname);
  const t = useTranslations("MobileNav");
  const essentialTriggerRef = useRef<HTMLButtonElement>(null);
  const plannedTriggerRef = useRef<HTMLButtonElement>(null);
  const projectTriggerRef = useRef<HTMLButtonElement>(null);
  const profileAlt = user.name ?? user.email ?? "Profile";

  const items: NavItem[] = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/projects", label: t("projects"), icon: Layers },
    { href: "/essentials", label: t("essentials"), icon: ShoppingCart },
    {
      href: "/settings",
      label: t("settings"),
      icon: User,
      imageSrc: user.image,
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
      <div className="flex items-center w-full pb-[calc(env(safe-area-inset-bottom)+12px)] ">
        <div className="flex-1 rounded-2xl border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
          <ul className="grid grid-cols-4 items-center">
            {items.map((item) => {
              const active =
                rest === item.href || rest.startsWith(item.href + "/");
              const Icon = item.icon ?? User;
              return (
                <li key={item.href} className="py-2 flex-1">
                  <Link
                    prefetch={true}
                    href={item.href}
                    aria-current={"page"}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-3 text-xs rounded-2xl transition-colors",
                      active
                        ? "text-background dark:text-foreground bg-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.imageSrc ? (
                      <span className="relative size-4 overflow-hidden rounded-full">
                        <Image
                          src={item.imageSrc}
                          alt={profileAlt}
                          fill
                          className="object-cover"
                          sizes="16px"
                        />
                      </span>
                    ) : (
                      <Icon className="size-4" aria-hidden="true" />
                    )}
                    <span className="text-xs text-center">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
