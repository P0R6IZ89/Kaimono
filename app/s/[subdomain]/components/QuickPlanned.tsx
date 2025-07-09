import { getPlannedCount } from "@/actions/plannedActions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Armchair, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { CreatePlannedDialog } from "../planned/dialogs/dialog-create";

async function QuickPlannedCard({ subdomain }: { subdomain: string }) {
  const count = await getPlannedCount(subdomain);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-3 items-center">
          <Armchair className="flex-none" />
          <div className="space-y-1">
            <p>Produtos Planejados</p>
            <p className="text-xs font-normal text-muted-foreground">
              Produtos de alto custo para serem comprados com planejamento.
            </p>
          </div>
        </CardTitle>
        <CardDescription></CardDescription>
        <CardContent>
          <div className="pt-4">
            <p className="text-2xl font-semibold">
              {count} {count != 1 ? "items" : "item"}
            </p>
          </div>
        </CardContent>
        <CardAction className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"outline"} className="size-7 rounded-full">
                <Plus />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar novo item</DialogTitle>
                <DialogDescription>
                  Adicione novo item na lista de planejados.
                </DialogDescription>
              </DialogHeader>
              <CreatePlannedDialog />
            </DialogContent>
          </Dialog>
          <Button variant={"outline"} className="size-7 rounded-full" asChild>
            <Link href={"/planned"}>
              <ArrowUpRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
}

export default QuickPlannedCard;
