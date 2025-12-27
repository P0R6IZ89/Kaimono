"use client";

import { usePathname } from "next/navigation";
import { Home, ListChecks, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { stripLeadingLocale } from "@/middleware";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/essentials", label: "Essentials", icon: Package },
  { href: "/planned", label: "Planned", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";
  const { rest } = stripLeadingLocale(pathname);

  return (
    <nav
      aria-label="Bottom navigation"
      suppressHydrationWarning
      className="fixed inset-x-0 bottom-0 z-50 "
    >
      <div className=" mx-auto max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="rounded-2xl border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
          <ul className="grid grid-cols-4">
            {items.map((item) => {
              const active =
                rest === item.href || rest.startsWith(item.href + "/");

              const Icon = item.icon;

              return (
                <li key={item.href} className="p-2">
                  <Link
                    prefetch={true}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-3 text-xs rounded-2xl transition-colors",
                      active
                        ? "text-foreground font-semibold bg-primary"
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
      </div>
    </nav>
  );
}
