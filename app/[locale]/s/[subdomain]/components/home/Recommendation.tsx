import { recentShoppingItemsType } from "../HomeContent";
import { RecentPlannedItems } from "./RecentPlannedItems";
import { RecentShoppingList } from "./RecentShoppingList";

export function Home({
  recentShoppingItems,
}: {
  recentShoppingItems: recentShoppingItemsType;
}) {
  return (
    <div className="space-y-8">
      <RecentShoppingList items={recentShoppingItems} />
      <RecentPlannedItems />
    </div>
  );
}
