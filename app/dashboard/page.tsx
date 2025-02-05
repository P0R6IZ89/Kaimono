import GraphBasic from "@/components/graph/graph-basic";
import GraphPlanned from "@/components/graph/graph-planned";
import { GraphSpend } from "@/components/graph/graph-spend";
// import Inicio from "@/components/inicio";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Dashboard() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h2 className="text-base">Inicio</h2>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4 grid-col-span-1 md:grid-cols-2">
          {/* <Inicio /> */}
          <GraphBasic />
          <GraphPlanned />
          <GraphSpend />
        </div>
      </div>
    </>
  );
}
