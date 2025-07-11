import MemberCount from "@/components/client/memberCounter";
import UserList from "@/components/client/userList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRound } from "lucide-react";
import React from "react";

function MembersCard({ subdomain }: { subdomain: string }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardDescription>
          <p>Membros do App</p>
        </CardDescription>
        <CardTitle className="text-xl font-normal">
          <MemberCount subdomain={subdomain} />
        </CardTitle>
        <CardAction className="text-muted-foreground">
          <UserRound />
        </CardAction>
      </CardHeader>
      <CardContent>
        <UserList subdomain={subdomain} />
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant={"outline"} disabled>
          Invitar
        </Button>
        <Button variant={"outline"} disabled>
          Gerenciar
        </Button>
      </CardFooter>
    </Card>
  );
}

export default MembersCard;
