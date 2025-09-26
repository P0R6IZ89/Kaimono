"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SignOut } from "./signout";
import { User } from "next-auth";

export default function UserAvatar({ user }: { user: User | undefined }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-row items-center rounded-xl gap-2">
          {user ? (
            <Avatar className="h-8 w-8 rounded-lg">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.email!} />
              ) : null}
              <AvatarFallback className="rounded-lg">
                {user.name ? user.name[0].toUpperCase() : null}
                {user.email ? user.email[0].toUpperCase() : null}
              </AvatarFallback>
            </Avatar>
          ) : null}
          <div className="grid flex-none text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user?.name}</span>
            <span className="truncate text-xs">{user?.email}</span>
          </div>
          <ChevronDown className="size-4 mt-auto mb-auto" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuItem asChild>
          <SignOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
