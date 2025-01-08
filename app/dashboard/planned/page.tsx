import React from "react";
import { toBuyList } from "@/util/ToBuyList";
import { priorities, statuses } from "@/app/data/data";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Circle, CircleCheckBig, MoreHorizontal } from "lucide-react";

async function getData() {
  // Fetch data from your API here.
  return toBuyList;
}

export default async function Essentials() {
  const data = await getData();
  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h2 className="text-base">Pao e leite</h2>
        </div>
      </header>
      <CardHeader>
        <CardTitle>Pao e leite</CardTitle>
        <CardDescription>dnsjfhdhdssdz</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex gap-4 justify-between items-center">
                  <div className="">
                    <Circle className="text-muted-foreground" />
                  </div>
                  <div className="flex grow gap-4 items-center">
                    <div>
                      <Badge variant={"outline"}>{item.priority}</Badge>
                    </div>
                    <div className=" max-w-[400px]">
                      <p className="truncate">{item.title}</p>
                      <p>{item.price}</p>
                    </div>
                  </div>
                  <div>
                    <MoreHorizontal />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
