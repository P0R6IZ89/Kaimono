import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getTenFirstUsersOfApp } from "@/actions/userActions";
import { MOCK_USERS } from "@/data/userData";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default async function UserList({ subdomain }: { subdomain: string }) {
  const response = await getTenFirstUsersOfApp(subdomain);
  // const response = { users: [], hasMore: false, overflowCount: 0 }; // Temporarily disable API call
  const limit = 4;

  const users = response?.users?.length
    ? response.users
    : MOCK_USERS.slice(0, limit);
  const hasMore = response?.users?.length
    ? response.hasMore
    : MOCK_USERS.length > limit;
  const overflowCount = response?.users?.length
    ? response.overflowCount
    : Math.max(0, MOCK_USERS.length - limit);

  return (
    <div className="flex justify-end">
      <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 ">
        {users.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No users found.</p>
        ) : (
          users.map((user, i) => (
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
        {hasMore ? (
          <Avatar className="size-8 rounded-full bg-muted text-muted-foreground">
            <AvatarFallback className="rounded-lg">
              +{overflowCount}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </div>
  );
}
