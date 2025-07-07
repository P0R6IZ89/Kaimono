import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Armchair, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

function QuickPlannedCard() {
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
            <p className="text-2xl font-semibold">12 items</p>
          </div>
        </CardContent>
        <CardAction className="flex gap-3">
          <Button variant={"outline"} className="size-7 rounded-full">
            <Plus />
          </Button>
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
