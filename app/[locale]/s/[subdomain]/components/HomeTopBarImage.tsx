"use client";

import { CldImage } from "next-cloudinary";
import { PLANNED_IMAGE_DEFAULT } from "@/lib/planned-defaults";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Star from "@/public/icons/Star.svg";
import React from "react";

export function HomeTopBarImage({
  projectType,
  imageSrc,
  alt,
  selected = true,
}: {
  projectType?: string | undefined;
  imageSrc?: string | null;
  alt: string;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-clip relative size-20 rounded-md transition-all",
        selected ? "opacity-100" : "opacity-90",
      )}
    >
      {projectType === "home" ? (
        <React.Fragment>
          <Image
            className="rounded-md"
            src={imageSrc || "/images/placeholder.png"}
            alt={alt}
            fill
            style={{ objectFit: "cover" }}
          />
          <Image
            className="rounded-md absolute size-6 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            alt="Star"
            width={16}
            height={16}
            src={Star}
          />
        </React.Fragment>
      ) : (
        <CldImage
          className={cn("bg-card rounded-md")}
          fill
          src={imageSrc || PLANNED_IMAGE_DEFAULT}
          alt={alt}
          style={{ objectFit: "cover" }}
        />
      )}
    </div>
  );
}
