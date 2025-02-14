import React from "react";
import { DataTable } from "@/components/table/data-table";
import { prisma } from "@/lib/prisma";
import { columns } from "@/components/table/essentials-columns";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CounterCard from "@/components/counter-card";

async function getData() {
  try {
    const data = await prisma.essentials.findMany();
    return data.map((item) => ({
      ...item,
      price: item.price.toNumber(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching essentials data:", error);
    throw new Error("Failed to fetch essentials data.");
  }
}

async function getCount() {
  const count = {
    fullCount: await prisma.essentials.count({}),
    pendingCount: await prisma.essentials.count({
      where: {
        status: "pending",
      },
    }),
  };
  return count;
}

export default async function Essentials() {
  const data = await getData();
  const count = await getCount();
  if (!data || !count.pendingCount) {
    return <p>Loading...</p>;
  }
  return (
    <div className="flex flex-col bg-neutral-50">
      <div className="flex h-16 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h2 className="text-base">Essenciais</h2>
      </div>
      <div className="p-4 space-y-8">
        <CardHeader className="min-h-64 justify-center">
          <CardTitle>Essenciais</CardTitle>
          <CardDescription>
            Lista de compras de produtos essenciais.
          </CardDescription>
        </CardHeader>
        <CounterCard count={count} />
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
