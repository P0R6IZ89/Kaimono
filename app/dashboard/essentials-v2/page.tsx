import React from "react";
import { DataTable } from "@/components/data-table";
import { prisma } from "@/lib/prisma";
import { columns } from "@/components/essentials-columns";

async function getData() {
  const data = await prisma.essentials.findMany();
  return data.map((item) => ({
    ...item,
    price: item.price.toString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export default async function Essentials() {
  const data = await getData();
  if (!data) {
    return <p>Loading...</p>;
  }
  return (
    <div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
