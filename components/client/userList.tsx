import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getTenFirstUsersOfApp } from "@/actions/userActions";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { getTranslations } from "next-intl/server";

export default async function UserList({ subdomain }: { subdomain: string }) {
  const response = await getTenFirstUsersOfApp(subdomain);
  const t = await getTranslations("Users");

  return (
    <div className="flex justify-end">
      <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 ">
        {response.users.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          response.users.map((user, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <Avatar className="size-8 rounded-full">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name ?? "User"} />
                  ) : (
                    <AvatarFallback className="rounded-lg">
                      {user.name
                        ? user.name[0].toUpperCase()
                        : user.email[0].toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.email}</p>
              </TooltipContent>
            </Tooltip>
          ))
        )}
        {response.hasMore ? (
          <Avatar className="size-8 rounded-full bg-muted text-muted-foreground">
            <AvatarFallback className="rounded-lg">
              +{response.overflowCount}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </div>
  );
}
