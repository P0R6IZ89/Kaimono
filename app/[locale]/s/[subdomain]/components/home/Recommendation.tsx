import {
  oldestPlannedItemsType,
  recentlyAddedType,
  recentShoppingItemsType,
} from "../HomeContent";
import { RecentPlannedItems } from "./RecentPlannedItems";
import { RecentShoppingList } from "./RecentShoppingList";
import { TimeToTakeAction } from "./TimeToTakeAction";

export function Home({
  recentShoppingItems,
  oldestPlannedItems,
  recentlyAdded,
}: {
  recentShoppingItems: recentShoppingItemsType;
  oldestPlannedItems: oldestPlannedItemsType;
  recentlyAdded: recentlyAddedType;
}) {
  return (
    <div className="space-y-2">
      <RecentShoppingList items={recentShoppingItems} />
      <TimeToTakeAction items={oldestPlannedItems} />
      <RecentPlannedItems items={recentlyAdded} />
    </div>
  );
}
