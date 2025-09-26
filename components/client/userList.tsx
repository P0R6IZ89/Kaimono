import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getTenFirstUsersOfApp } from "@/actions/userActions";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default async function UserList({ subdomain }: { subdomain: string }) {
  const users = await getTenFirstUsersOfApp(subdomain);
  // const users = MOCK_USERS;

  if (!users) {
    return (
      <p className="text-muted-foreground">Nenhum usuário foi encontrado.</p>
    );
  }

  return (
    <div className="max-h-48 flex flex-col space-y-4 overflow-x-auto">
      <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 ">
        {users.users.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No users found.</p>
        ) : (
          users.users.map((user, i) => (
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
        {users.hasMore ? (
          <Avatar className="size-8 rounded-full bg-muted text-muted-foreground">
            <AvatarFallback className="rounded-lg">
              +{users.overflowCount}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </div>
  );
}
