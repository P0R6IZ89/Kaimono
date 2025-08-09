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

export default async function Invite({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const app = await getCurrentAppAction(subdomain);
  const invitedUsers = await getInvitedUsersActions(subdomain);
  return (
    <div>
      <Card className="max-w-lg border-none shadow-none">
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
      <Card className="max-w-lg border-none shadow-none">
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
    </div>
  );
}
