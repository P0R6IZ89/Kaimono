"use client";

import { CldImage } from "next-cloudinary";
import { cn } from "@/lib/utils";

export function HomeTopBarImage({
  imageSrc,
  alt,
  selected = true,
}: {
  imageSrc: string | null;
  alt: string;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative size-20 overflow-clip rounded-md border bg-muted/40 transition-all",
        selected
          ? "border-primary/50 border-2 bg-card shadow-sm ring-2 ring-primary/20"
          : "border-border text-muted-foreground",
      )}
    >
      {imageSrc ? (
        <CldImage
          className={cn("bg-card", !selected && "opacity-80")}
          removeBackground
          fill
          src={imageSrc}
          alt={alt}
          style={{ objectFit: "cover" }}
        />
      ) : null}
    </div>
  );
}
