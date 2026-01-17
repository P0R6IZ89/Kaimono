import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Progress } from "../../../../../../components/ui/progress";

interface CounterCardProps {
  count: {
    fullCount: number;
    pendingCount: number;
  };
}

function CounterCardV2({
  count: { fullCount, pendingCount },
}: CounterCardProps) {
  const completed = fullCount - pendingCount;
  const percentage = (completed / fullCount) * 100;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Produtos Pendentes
        </CardTitle>
        <ShoppingCart
          size={16}
          strokeWidth={2}
          className="text-muted-foreground"
        />
      </CardHeader>
      <CardContent>
        <span className="flex gap-2 items-end">
          <p className="text-2xl font-bold">{pendingCount}</p>
          <p>{pendingCount === 1 ? "Produto" : "Produtos"}</p>
        </span>
        <div className="flex flex-row gap-4 items-center pt-1">
          <p className="flex-none text-xs text-muted-foreground">
            {completed} de {fullCount} completo
          </p>
          <Progress className="h-2" value={percentage} />
        </div>
      </CardContent>
    </Card>
  );
}

export default CounterCardV2;
