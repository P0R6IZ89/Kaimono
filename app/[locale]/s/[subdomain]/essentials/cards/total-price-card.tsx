import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPriceYen } from "@/lib/formatPriceYen";
import { DollarSign } from "lucide-react";
import React from "react";
import { getTranslations } from "next-intl/server";

interface totalPendingPriceProps {
  totalPendingPrice: number;
}

async function TotalPriceCard(totalPendingPrice: totalPendingPriceProps) {
  const t = await getTranslations("Essentials");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {t("stats.totalValue")}
        </CardTitle>
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
          {t("stats.pendingProductsSum")}
        </p>
      </CardContent>
    </Card>
  );
}

export default TotalPriceCard;
