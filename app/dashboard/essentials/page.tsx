import React from "react";
import { toBuyList } from "@/util/ToBuyList";
import { columns, ToBuy } from "@/components/planned-columns";
import { DataTable } from "@/components/data-table";

async function getData(): Promise<ToBuy[]> {
  return toBuyList;
}

export default async function Essentials() {
  const data = await getData();
  return (
    <div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
