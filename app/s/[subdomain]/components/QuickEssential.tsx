import { getEssentialCount } from "@/actions/essentialsActions";
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
    <Card className="col-span-2 sm:col-span-1">
      <CardHeader>
        <CardDescription>
          <p>Produtos Essenciais</p>
        </CardDescription>
        <CardTitle className="flex items-end gap-2 text-2xl font-normal">
          <p className="text-3xl font-extrabold">{count}</p>{" "}
          {count != 1 ? "items pendentes" : "item pendente"}
        </CardTitle>
        <CardAction>
          <Shirt />
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter className="flex flex-1 gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={"default"}>
              <Plus />
              Adicionar
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
        <Button variant={"outline"} asChild>
          <Link href={"/essentials"}>
            Ver mais
            <ArrowUpRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default QuickEssentialCard;
