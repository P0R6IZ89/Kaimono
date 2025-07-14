import { getPlannedBySubdomain } from "@/actions/plannedActions";
import React from "react";
import { DataTablePlanned } from "./table/data-table";
import { columnsPlanned } from "./table/columns";

export interface PlannedJSON {
  id: string;
  image: string;
  title: string;
  price: number | null;
  status: string;
  priority: string;
  productUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  appId: string;
  // Like
  likedByMe: boolean;
  likesCount: number;
  // User
  userEmail: string | null;
  username: string | null;
  userImage: string | null;
  commentsCount: number;
  comments: Array<{
    authorImage: string | null;
    authorName?: string | null;
    authorEmail?: string;
    content: string;
    createdAt: string;
  }>;
}

export default async function Planned({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const planned: PlannedJSON[] = await getPlannedBySubdomain(subdomain);
  return (
    <div className="p-4 space-y-8 max-w-xl">
      <div className="flex px-6 min-h-32 items-center">
        <div className="">
          <h1 className="leading-none font-semibold">Planejados</h1>
          <p className="text-muted-foreground text-sm pt-2">
            Lista de compras de produtos de alto custo.
          </p>
        </div>
      </div>

      {planned ? (
        <DataTablePlanned columns={columnsPlanned} data={planned} />
      ) : (
        <div className="text-center">No results.</div>
      )}
    </div>
  );
}
