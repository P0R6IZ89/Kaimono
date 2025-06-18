import UserName from "@/components/client/username";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRound } from "lucide-react";
import React from "react";

export default function Essentials() {
  const menbers = true;
  return (
    <div className="p-4 space-y-8 max-w-1/2">
      <div className="min-h-64 justify-center">
        <h2 className="text-base text-muted-foreground leading-none font-semibold">
          Bem Vindo
        </h2>
        <h1 className="text-xl leading-none font-semibold">
          <UserName />
        </h1>
      </div>
      <CardHeader className="min-h-64 justify-center">
        <CardTitle>
          <p className="text-base text-muted-foreground">Bem Vindo!</p>
          <UserName />
        </CardTitle>
        <CardDescription>
          O Aplicativo Definitivo de Controle de Conpras.
        </CardDescription>
      </CardHeader>
      <div>
        {menbers ? (
          <Card>
            <CardHeader>
              <CardTitle>Membros</CardTitle>
              <CardDescription>xx membros</CardDescription>
              <CardAction>
                <UserRound />
              </CardAction>
              <CardContent>Hello</CardContent>
            </CardHeader>
          </Card>
        ) : (
          <div className="text-center">No results.</div>
        )}
      </div>
    </div>
  );
}
