"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Slot } from "@radix-ui/react-slot";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export type RadialItem = {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

type RadialPieMenuProps = {
  items: RadialItem[];
  radius?: number; // px
  itemSize?: number; // px
  defaultOpen?: boolean;
  // Wrap the trigger: pass handlers straight to the child via Radix Slot
  asChild?: boolean;
  children?: React.ReactNode;
  // Layout angles (radians), clockwise from 12 o'clock
  startAngleCW?: number; // default 0 (12 o'clock)
  sweepAngleCW?: number; // default 2π (full circle)
  // Open menu at a fixed screen coordinate instead of the pointer
  fixedCenter?: { x: number; y: number };
};

export function RadialPieMenu({
  items,
  radius = 110,
  itemSize = 48,
  defaultOpen = false,
  asChild = false,
  children,
  startAngleCW = 0, // 0 = 12 o'clock
  sweepAngleCW = Math.PI * 2, // full circle by default
  fixedCenter,
}: RadialPieMenuProps) {
  const t = useTranslations("RadialMenu");
  const [open, setOpen] = React.useState(defaultOpen);
  const [center, setCenter] = React.useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const scrollOpts = { passive: true } satisfies AddEventListenerOptions;

  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("blur", close);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, scrollOpts);
    return () => {
      window.removeEventListener("blur", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close);
    };
  }, [open, scrollOpts]);

  React.useEffect(() => {
    if (open && overlayRef.current) overlayRef.current.focus();
  }, [open]);

  const openAt = (x: number, y: number) => {
    setCenter({ x, y });
    setActiveIndex(-1);
    setOpen(true);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fixedCenter) openAt(fixedCenter.x, fixedCenter.y);
    else openAt(e.clientX, e.clientY);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (fixedCenter) openAt(fixedCenter.x, fixedCenter.y);
    else openAt(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!open) return;
    const dx = e.clientX - center.x;
    const dy = e.clientY - center.y;
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      setActiveIndex(-1);
      return;
    }
    const twoPI = Math.PI * 2;
    const angle = Math.atan2(dy, dx);
    const cw = (angle + Math.PI / 2 + twoPI) % twoPI; // clockwise from 12 o'clock

    const total = items.length;
    const sweep = typeof sweepAngleCW === "number" ? sweepAngleCW : twoPI;
    const start = typeof startAngleCW === "number" ? startAngleCW : 0;

    if (sweep < twoPI - 1e-6) {
      // Project onto arc [start, start + sweep]; snap to nearest end if outside
      let delta = (cw - start + twoPI) % twoPI;
      if (delta > sweep) {
        delta = delta - sweep < sweep / 2 ? sweep : 0;
      }
      const unit = sweep > 0 ? delta / sweep : 0;
      const idx = total > 1 ? Math.floor(unit * (total - 1) + 0.5) : 0;
      setActiveIndex(idx);
    } else {
      // Full circle (nearest sector)
      const unit = cw / twoPI;
      const idx = Math.floor(unit * total + 0.5) % total;
      setActiveIndex(idx);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    const total = items.length;
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((i) => (i < 0 ? 0 : (i + delta + total) % total));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const item = items[activeIndex];
      if (!item.disabled) {
        item.onSelect();
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const onSelect = (idx: number) => {
    const item = items[idx];
    if (!item || item.disabled) return;
    item.onSelect();
    setOpen(false);
  };

  const positions = React.useMemo(() => {
    const total = items.length;
    const twoPI = Math.PI * 2;
    const sweep = typeof sweepAngleCW === "number" ? sweepAngleCW : twoPI;
    const start = typeof startAngleCW === "number" ? startAngleCW : 0;

    if (sweep < twoPI - 1e-6) {
      return items.map((_, i) => {
        const t = total > 1 ? i / (total - 1) : 0.5; // endpoints included
        const cw = (start + t * sweep) % twoPI; // clockwise from 12
        const theta = cw - Math.PI / 2; // convert to math angle
        return { x: Math.cos(theta) * radius, y: Math.sin(theta) * radius };
      });
    }

    // Full circle
    return items.map((_, i) => {
      const cw = (i / total) * twoPI; // 0..2π clockwise from 12
      const theta = cw - Math.PI / 2;
      return { x: Math.cos(theta) * radius, y: Math.sin(theta) * radius };
    });
  }, [items, radius, startAngleCW, sweepAngleCW]);

  const triggerProps = {
    onContextMenu: handleContextMenu,
    onClick: handleClick,
    className: "select-none",
  } as const;

  const trigger =
    asChild && children ? (
      <Slot {...triggerProps}>{children}</Slot>
    ) : (
      <div {...triggerProps} className="relative">
        {children ?? (
          <Button type="button" variant="outline">
            {t("open")}
          </Button>
        )}
      </div>
    );

  return (
    <>
      {trigger}

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="radial-overlay"
                ref={overlayRef}
                tabIndex={-1}
                className="fixed inset-0 z-70 outline-none"
                onPointerMove={onPointerMove}
                onPointerDown={(e) => {
                  const target = e.target as HTMLElement;
                  if (!target.closest("[data-radial-item]")) setOpen(false);
                }}
                onKeyDown={onKeyDown}
                aria-label={t("overlay")}
                role="dialog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 bg-black/20" />

                <motion.div
                  className="absolute"
                  style={{
                    left: center.x,
                    top: center.y,
                  }}
                  initial={{ scale: 0.9, opacity: 0, x: "-50%", y: "-50%" }}
                  animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
                  exit={{ scale: 0.95, opacity: 0, x: "-50%", y: "-50%" }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                >
                  <div className="relative">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background border shadow-md pointer-events-none">
                      <span className="text-xs text-muted-foreground">
                        <X />
                      </span>
                    </div>

                    {items.map((item, i) => {
                      const pos = positions[i];
                      const isActive = i === activeIndex;
                      const Icon = item.icon;
                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          data-radial-item
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(i);
                          }}
                          onPointerEnter={() => setActiveIndex(i)}
                          onPointerLeave={() => setActiveIndex(-1)}
                          disabled={item.disabled}
                          className={cn(
                            "absolute -translate-x-1/2 -translate-y-1/2",
                            "flex items-center justify-center rounded-full border shadow-md",
                            "bg-background hover:bg-muted focus:outline-none",
                            "transition-colors",
                            isActive && "ring-2 ring-primary",
                            item.disabled && "opacity-50 cursor-not-allowed",
                          )}
                          style={{
                            left: pos.x,
                            top: pos.y,
                            width: itemSize,
                            height: itemSize,
                          }}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.85, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: i * 0.02,
                          }}
                          aria-label={item.label}
                          title={item.label}
                        >
                          {Icon ? (
                            <Icon className="w-5 h-5" aria-hidden="true" />
                          ) : (
                            <span className="text-xs">
                              {item.label.slice(0, 3)}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
