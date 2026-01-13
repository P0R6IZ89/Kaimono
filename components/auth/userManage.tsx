"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { $Enums } from "@prisma/client";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useState } from "react";
import { Dialog } from "../ui/dialog";
import DialogLogout from "@/app/[locale]/(auth)/logout/dialog-logout";
import { Item, ItemMedia } from "../ui/item";
import { useTranslations } from "next-intl";

type MemberRole = $Enums.Role;

interface NavUserProps {
  variant?: "default" | "outline" | "muted" | null | undefined;
  className?: string | undefined;
  user?: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
  memberRole?: MemberRole;
}

export function UserManager({
  user,
  memberRole,
  variant,
  className,
}: NavUserProps) {
  const t = useTranslations("UserManager");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const roleLabel = memberRole ? t(`roles.${memberRole}`) : undefined;
  if (!user) {
    return <Button size="lg">Sign in</Button>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Item variant={variant} className={`${className} px-2.5 py-2`}>
          <ItemMedia>
            <Avatar className="rounded-lg">
              {user.image && <AvatarImage src={user.image} alt={user.email} />}
              <AvatarFallback className="rounded-lg">
                {user.name
                  ? user.name[0].toUpperCase()
                  : user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </ItemMedia>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs text-foreground/70">
              {user.email}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </Item>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={"bottom"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              {user.image && <AvatarImage src={user.image} alt={user.email} />}
              <AvatarFallback className="rounded-lg">
                {user.name
                  ? user.name[0].toUpperCase()
                  : user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              {roleLabel && <span className="text-xs">{roleLabel}</span>}

              {user.name ? (
                <span className="truncate font-semibold">{user.name}</span>
              ) : (
                <span className="truncate">{user.email}</span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setIsDialogOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <LogOut />
              <span>Log out</span>
            </div>
          </DropdownMenuItem>
          <DialogLogout />
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
