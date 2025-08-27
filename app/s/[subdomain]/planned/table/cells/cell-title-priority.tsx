import React from "react";
import { RowCellProps } from "./cell-profile";
import { Badge } from "@/components/ui/badge";
import { Link as LucidLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function TitleCell({ row }: RowCellProps) {
  const { title, priority, productUrl } = row.original;
  return (
    <div className="flex justify-between pt-4 px-4 text-foreground">
      <p className="text-lg font-semibold">{title}</p>
      <div className=" flex flex-row items-start h-fit gap-2">
        {productUrl ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Badge variant={"outline"}>
                <LucidLink strokeWidth={2} className="text-foreground" />
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-69" side="bottom" align="end">
              <DropdownMenuItem>
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline line-clamp-3 break-all"
                >
                  {productUrl}
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <Badge
          variant={"outline"}
          className={`${
            priority === "high" ? "text-destructive border-destructive" : null
          }`}
        >
          {priority}
        </Badge>
      </div>
    </div>
  );
}

export default TitleCell;
