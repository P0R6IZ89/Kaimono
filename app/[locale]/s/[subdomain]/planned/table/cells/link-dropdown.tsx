import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LucideLink } from "lucide-react";
import React from "react";

export default function LinkDropdownCell({
  productUrl,
}: {
  productUrl?: string | null;
}) {
  return (
    <React.Fragment>
      {productUrl ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Badge variant={"outline"}>
              <LucideLink strokeWidth={2} className="text-foreground" />
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-69" side="bottom" align="center">
            <DropdownMenuItem asChild>
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
    </React.Fragment>
  );
}
