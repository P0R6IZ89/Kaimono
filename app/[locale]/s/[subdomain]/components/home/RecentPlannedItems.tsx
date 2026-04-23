import { ScrollArea } from "@/components/ui/scroll-area";

export function RecentPlannedItems() {
  return (
    <section>
      <p className="mb-2 text-sm">Recent planned items</p>
      <ScrollArea className="h-32 w-fit flex flex-row gap-2">
        <div></div>
      </ScrollArea>
    </section>
  );
}
