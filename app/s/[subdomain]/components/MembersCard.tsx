import MemberCount from "@/components/client/memberCounter";
import UserList from "@/components/client/userList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRound } from "lucide-react";
import React from "react";

function MembersCard({ subdomain }: { subdomain: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-3 items-center">
          <UserRound className="flex-none" />
          <div className="space-y-1">
            <p>Membros do App</p>
            <MemberCount
              className="text-xs font-normal text-muted-foreground"
              subdomain={subdomain}
            />
          </div>
        </CardTitle>
        <CardDescription></CardDescription>
        <CardContent>
          <UserList subdomain={subdomain} />
        </CardContent>
      </CardHeader>
    </Card>
  );
}

export default MembersCard;
