import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { ShoppingCart } from "lucide-react";
import { Progress } from "../../ui/progress";

interface CounterCardProps {
  count: {
    fullCount: number;
    pendingCount: number;
  };
}

function CounterCard({ count: { fullCount, pendingCount } }: CounterCardProps) {
  const completed = fullCount - pendingCount;
  const percentage = (completed / fullCount) * 100;
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col gap-4 pt-6">
        {pendingCount > 0 ? (
          <>
            <div className="flex flex-row justify-between items-baseline">
              <span className="flex flex-row gap-2 items-baseline">
                <p className="text-2xl font-bold text-primary">
                  {pendingCount}
                </p>
                <p className="text-base font-medium">produtos pendentes</p>
              </span>
              <ShoppingCart
                size={16}
                strokeWidth={2}
                className="text-muted-foreground"
              />
            </div>
            <div className="flex flex-row gap-4 items-center">
              <p className="flex-none text-xs text-muted-foreground">
                {completed} de {fullCount} completo
              </p>
              <Progress className="h-2" value={percentage} />
            </div>
          </>
        ) : (
          <CardHeader>
            <CardTitle>Parabéns! 😍🎉</CardTitle>
            <CardDescription>
              Você não tem nenhuma compra pendente!
            </CardDescription>
          </CardHeader>
        )}
      </CardContent>
    </Card>
  );
}

export default CounterCard;
