import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Squirrel } from "lucide-react";
import { getAllUserOfApp } from "@/actions/userActions";

export default async function UserList({ subdomain }: { subdomain: string }) {
  const users = await getAllUserOfApp(subdomain);
  // const users = randomUsers;

  if (!users) {
    return (
      <p className="text-muted-foreground">Nenhum usuário foi encontrado.</p>
    );
  }

  return (
    <div className="pt-4 max-h-64 flex flex-col space-y-4 overflow-x-auto">
      {users.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No users found.</p>
      ) : (
        users.map((user, i) => (
          <div key={i} className="flex items-center gap-2">
            <Avatar className="size-8 rounded-lg">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name ?? "User"} />
              ) : (
                <AvatarFallback className="rounded-lg">
                  <Squirrel />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col text-sm leading-tight">
              <p>{user.name ?? "- - -"}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
