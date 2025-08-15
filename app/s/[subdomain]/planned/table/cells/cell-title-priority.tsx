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
import { protocol, rootDomain } from "@/lib/utils";

function TitleCell({ row }: RowCellProps) {
  const { title, priority } = row.original;
  return (
    <div className="static flex justify-between top-8 px-3 text-foreground">
      <p className="text-lg font-semibold">{title}</p>
      <div className="flex flex-row gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge variant={"outline"}>
              <LucidLink />
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <a
                href={""}
                target="_blank"
                rel="noopener noreferrer"
              >{`${protocol}://${rootDomain}`}</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
