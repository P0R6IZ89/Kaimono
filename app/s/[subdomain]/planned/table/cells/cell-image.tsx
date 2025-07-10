import React from "react";
import { RowCellProps } from "./cell-profile";
import { CldImage } from "next-cloudinary";

function ImageCell({ row }: RowCellProps) {
  const { image, title } = row.original;
  return (
    <div className="static top-0 brightness-75 rounded-xl overflow-clip">
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
