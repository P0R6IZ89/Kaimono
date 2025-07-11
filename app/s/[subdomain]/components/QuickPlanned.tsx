import { getPlannedCount } from "@/actions/plannedActions";
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

import { Armchair, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { CreatePlannedDialogTrigger } from "../planned/dialogs/dialog-create-trigger";

async function QuickPlannedCard({ subdomain }: { subdomain: string }) {
  const count = await getPlannedCount(subdomain);

  return (
    <Card className="col-span-2 sm:col-span-1">
      <CardHeader>
        <CardDescription>
          <p>Produtos Planejados</p>
        </CardDescription>
        <CardTitle className="flex items-end gap-2 text-2xl font-normal">
          <p className="text-3xl font-extrabold">{count}</p>{" "}
          {count != 1 ? "items pendentes" : "item pendente"}
        </CardTitle>
        <CardAction>
          <Armchair />
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter className="flex-1 gap-2">
        <CreatePlannedDialogTrigger>
          <Button variant={"default"}>
            <Plus />
            Adicionar
          </Button>
        </CreatePlannedDialogTrigger>

        <Button variant={"outline"} asChild>
          <Link href={"/planned"}>
            Ver mais
            <ArrowUpRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default QuickPlannedCard;
