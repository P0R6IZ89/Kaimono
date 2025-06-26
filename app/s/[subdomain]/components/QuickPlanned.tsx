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
import React from "react";

function QuickPlannedCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-3 items-center">
          <Armchair />
          <div className="space-y-1">
            <p>Essenciais</p>
            <p className="text-xs font-normal text-muted-foreground">
              Produtos essenciais de baixo custo.
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
          <Button variant={"outline"} className="size-7 rounded-full">
            <ArrowUpRight />
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
}

export default QuickPlannedCard;
