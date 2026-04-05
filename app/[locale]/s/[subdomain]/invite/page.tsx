import React from "react";
import InviteForm from "./inviteForm";
import { getCurrentAppAction, requireMembership } from "@/actions/appActions";
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
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

export default async function Invite({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { locale, subdomain } = await params;
  const t = await getTranslations({ locale, namespace: "Invite" });
  const membership = await requireMembership(subdomain);

  if (membership.role === "MEMBER") {
    redirect({ href: `/s/${subdomain}`, locale });
  }

  const app = await getCurrentAppAction(subdomain);
  const invitedUsers = await getInvitedUsersActions(subdomain);
  const users = await getAllUserOfApp(subdomain);
  const userCount = users.length;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 justify-center gap-4 p-4 mb-24 md:mb-0">
      <Card>
        <CardHeader>
          <CardTitle>{t("teamMembers.title", { userCount })}</CardTitle>
          <CardDescription>{t("teamMembers.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="size-6 rounded-full">
                      {user.image ? <AvatarImage src={user.image} /> : null}
                      <AvatarFallback className="rounded-lg">
                        {user.name
                          ? user.name[0].toUpperCase()
                          : user.email[0].toUpperCase()}
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
      <Card className="">
        <CardHeader>
          <CardTitle>{t("pendingInvites.title")}</CardTitle>
          <CardDescription>{t("pendingInvites.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("fields.email")}</TableHead>
                <TableHead>{t("fields.status")}</TableHead>
                <TableHead>{t("actions.label")}</TableHead>
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
      <Card className="">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            <p>{t("description")}</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm app={app} />
        </CardContent>
      </Card>
    </div>
  );
}
