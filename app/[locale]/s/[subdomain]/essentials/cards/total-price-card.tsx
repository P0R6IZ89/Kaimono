import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPriceYen } from "@/lib/formatPriceYen";
import { DollarSign } from "lucide-react";
import React from "react";

interface totalPendingPriceProps {
  totalPendingPrice: number;
}

function TotalPriceCard(totalPendingPrice: totalPendingPriceProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
        <DollarSign
          size={16}
          strokeWidth={2}
          className="text-muted-foreground"
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatPriceYen(totalPendingPrice.totalPendingPrice)}
        </div>
        <p className="text-xs text-muted-foreground">
          Soma dos produtos pendentes.
        </p>
      </CardContent>
    </Card>
  );
}

export default TotalPriceCard;
