import React from "react";
import InviteForm from "./inviteForm";
import { getCurrentAppAction } from "@/actions/appActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getInvitedUsersActions } from "@/actions/invitationActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ActionsButton from "./actionButtom";
import { getAllUserOfApp } from "@/actions/userActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function Invite({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const app = await getCurrentAppAction(subdomain);
  const invitedUsers = await getInvitedUsersActions(subdomain);
  const users = await getAllUserOfApp(subdomain);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 justify-center gap-4 p-4">
      <Card className="">
        <CardHeader>
          <CardTitle>Convide seus amigos para o app!</CardTitle>
          <CardDescription>
            <p>
              Envie um e-mail para seu amigo com a url do convite. Estara
              disponível por 9 dias.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm app={app} />
        </CardContent>
      </Card>
      <Card className="">
        <CardHeader>
          <CardTitle>Convites pendentes</CardTitle>
          <CardDescription>
            Gerenciar os convites do aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <ActionsButton
                      status={user.status}
                      invitationId={user.id}
                      subdomain={subdomain}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Usuários do App ({users.length})</CardTitle>
          <CardDescription>Usuários do aplicativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead className="max-w-[100px]">Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[30px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="size-6 rounded-full">
                      {user.image ? <AvatarImage src={user.image} /> : null}
                      <AvatarFallback className="rounded-lg">
                        {user.name ? user.name[0].toUpperCase() : null}
                        {user.email ? user.email[0].toUpperCase() : null}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="flex justify-center">
                    <ActionsButton
                      status={"ACCEPTED"}
                      invitationId={user.id}
                      subdomain={subdomain}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
