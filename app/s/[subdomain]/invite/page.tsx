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

export default async function Invite({
  params,
}: {
  params: { subdomain: string };
}) {
  const { subdomain } = await params;
  const app = await getCurrentAppAction(subdomain);
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
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </div>
  );
}
