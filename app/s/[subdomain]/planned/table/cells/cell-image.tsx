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
          // removeBackground
          defaultImage="placeholder_dtzhrr.png"
          // opacity={80}
          // gradientFade={"symmetric:10,y_0.1"}
        />
      ) : (
        <CldImage
          src="https://res.cloudinary.com/dsttcre2h/image/upload/v1751870559/placeholder_dtzhrr.png"
          width={800}
          height={800}
          crop={"fill"}
          alt={title}
          // gradientFade={"symmetric:20,y_0.3"}
        />
      )}
    </div>
  );
}

export default ImageCell;
