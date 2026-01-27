import React from "react";
import { CldImage } from "next-cloudinary";
import { Row } from "@tanstack/react-table";
import { PlannedSchema } from "@/app/[locale]/types/planned";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

function ImageCell({ row }: { row: Row<PlannedSchema> }) {
  const { image, title } = row.original;
  return (
    <div className="relative top-0 rounded-t-xl overflow-clip">
      {image ? (
        <Dialog>
          <DialogTrigger asChild>
            <CldImage
              src={image}
              width={1280}
              height={720}
              crop={"fill"}
              alt={title}
              gravity="center"
              defaultImage="placeholder_dtzhrr.png"
              // removeBackground={true}
            />
          </DialogTrigger>
          <DialogContent className="max-w-full">
            <CldImage
              className="w-full"
              width={1280}
              height={1280}
              src={image}
              alt={title}
              gravity="center"
              defaultImage="placeholder_dtzhrr.png"
              // removeBackground={true}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <CldImage
          src="https://res.cloudinary.com/dsttcre2h/image/upload/v1751870559/placeholder_dtzhrr.png"
          width={1280}
          height={720}
          crop={"fill"}
          alt={title}
        />
      )}
    </div>
  );
}

export default ImageCell;
