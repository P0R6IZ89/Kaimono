import React from "react";
import { CldImage } from "next-cloudinary";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/[locale]/types/planned";

function ImageCell({ row }: { row: Row<PlannedSchema> }) {
  const { image, title } = row.original;
  return (
    <div className="relative top-0 rounded-xl overflow-clip">
      <div className="absolute h-full w-full" />
      {image ? (
        <CldImage
          src={image}
          width={800}
          height={800}
          crop={"fill"}
          alt={title}
          gravity="center"
          defaultImage="placeholder_dtzhrr.png"
        />
      ) : (
        <CldImage
          src="https://res.cloudinary.com/dsttcre2h/image/upload/v1751870559/placeholder_dtzhrr.png"
          width={800}
          height={800}
          crop={"fill"}
          alt={title}
        />
      )}
    </div>
  );
}

export default ImageCell;
