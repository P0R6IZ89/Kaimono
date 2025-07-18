import React from "react";
import { RowCellProps } from "./cell-profile";
import { CldImage } from "next-cloudinary";

function ImageCell({ row }: RowCellProps) {
  const { image, title } = row.original;
  return (
    <div className="relative top-0 rounded-xl overflow-clip">
      <div className="absolute bg-gradient-to-b from-black/30 from-10% via-black/0 to-black/30 to-90% h-full w-full" />
      {image ? (
        <CldImage
          src={image}
          width={800}
          height={800}
          crop={"fill"}
          alt={title}
          removeBackground
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
