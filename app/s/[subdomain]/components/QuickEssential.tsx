import { getEssentialCount } from "@/actions/essentialsActions";
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
import { ArrowUpRight, Plus, Shirt } from "lucide-react";
import Link from "next/link";
import React from "react";
import { CreateEssentialDialog } from "../essentials/dialogs/dialog-create";

async function QuickEssentialCard({ subdomain }: { subdomain: string }) {
  const count = await getEssentialCount(subdomain);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-3 items-center">
          <Shirt className="flex-none" />
          <div className="space-y-1">
            <p>Produtos Essenciais</p>
            <p className="text-xs font-normal text-muted-foreground">
              Produtos essenciais de baixo custo.
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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar novo item</DialogTitle>
                <DialogDescription>
                  Adicione novo item na lista de essenciais.
                </DialogDescription>
              </DialogHeader>
              <CreateEssentialDialog />
            </DialogContent>
          </Dialog>
          <Button variant={"outline"} className="size-7 rounded-full" asChild>
            <Link href={"/essentials"}>
              <ArrowUpRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
}

export default QuickEssentialCard;
