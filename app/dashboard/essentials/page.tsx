import React from "react";
import { toBuyList } from "@/util/ToBuyList";
import { columns, ToBuy } from "@/components/columns";
import { DataTable } from "@/components/data-table";

async function getData(): Promise<ToBuy[]> {
  // Fetch data from your API here.
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
