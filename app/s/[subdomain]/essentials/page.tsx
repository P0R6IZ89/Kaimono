import React from "react";
import { DataTable } from "@/app/s/[subdomain]/essentials/table/data-table";
import { columns } from "@/app/s/[subdomain]/essentials/table/essentials-columns";
import { getEssentialsBySubdomain } from "@/actions/essentialsActions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EssentialsProps {
  params: Promise<{ subdomain: string }>;
}

export default async function Essentials({ params }: EssentialsProps) {
  const { subdomain } = await params;
  const essentials = await getEssentialsBySubdomain(subdomain);

  return (
    <section className="p-4 space-y-8 max-w-xl ">
      <Card className="shadow-none ">
        <CardHeader>
          <CardTitle>Essenciais</CardTitle>
          <CardDescription>
            Lista de compras de produtos essenciais.
          </CardDescription>
        </CardHeader>
      </Card>
      <div>
        {essentials ? (
          <div className="space-y-8">
            <DataTable columns={columns} data={essentials} />
          </div>
        ) : (
          <div className="text-center">No results.</div>
        )}
      </div>
    </section>
  );
}
