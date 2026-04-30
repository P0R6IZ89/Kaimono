"use client";

import { CldImage } from "next-cloudinary";
import { PROJECT_IMAGE_DEFAULT } from "@/lib/planned-defaults";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Star from "@/public/icons/Star.svg";
import React from "react";

export function HomeTopBarImage({
  isDefaultImage = false,
  imageSrc,
  alt,
  selected = true,
}: {
  isDefaultImage?: boolean;
  imageSrc?: string | null;
  alt: string;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative size-20 overflow-clip rounded-md border bg-muted/40 transition-all",
        selected
          ? "border-primary/50 border-2 bg-card  ring-2 ring-primary/20"
          : "border-border text-muted-foreground",
      )}
    >
      {isDefaultImage ? (
        <React.Fragment>
          <Image
            src={imageSrc || "/images/placeholder.png"}
            alt={alt}
            fill
            style={{ objectFit: "cover" }}
          />
          <Image
            className="absolute size-6 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            alt="Star"
            width={16}
            height={16}
            src={Star}
          />
        </React.Fragment>
      ) : (
        <CldImage
          className={cn("bg-card", !selected && "opacity-80")}
          fill
          src={imageSrc || PROJECT_IMAGE_DEFAULT}
          alt={alt}
          style={{ objectFit: "cover" }}
        />
      )}
    </div>
  );
}
