import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

import { toBuyList } from "@/util/ToBuyList";
import { formatPriceYen } from "@/util/FormatPriceYen";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const filterTopFive = toBuyList.filter((_, index) => index < 5);

const Inicio = () => {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Alta Prioridade</CardTitle>
        <CardDescription>
          Compras pendentes de alto nível de prioridade.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Table>
          <TableCaption>
            Lista dos top 5 compras de alta prioridade
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">Status</TableHead>
              <TableHead>Compra</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="text-right">Quant.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filterTopFive.map((toBuy, index) => (
              <TableRow key={index}>
                <TableCell className="w-[30]">{toBuy.status}</TableCell>
                <TableCell>{toBuy.title}</TableCell>
                <TableCell>{formatPriceYen(toBuy.price)}</TableCell>
                <TableCell className="text-right">{toBuy.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Inicio;
