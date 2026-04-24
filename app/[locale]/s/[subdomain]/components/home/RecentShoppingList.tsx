import { Card, CardContent } from "@/components/ui/card";
import { recentShoppingItemsType } from "../HomeContent";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { PlusCircle } from "lucide-react";

export function RecentShoppingList({
  items,
}: {
  items: recentShoppingItemsType;
}) {
  if (items.length === 0) {
    return (
      <div>
        <p className="mb-2 text-sm">Recent shopping items</p>
        <Link href="/essentials">
          <Card className="h-32 ring-0 border border-dashed">
            <CardContent className="flex flex-col gap-2 items-center justify-center h-full">
              <p className="text-muted-foreground">
                <PlusCircle />
              </p>
              <p className="text-muted-foreground">
                There are no shopping items yet.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    );
  }
  return (
    <div>
      <p className="mb-2 text-sm">Recent shopping items</p>
      <Card className="p-0 max-h-32 overflow-y-auto">
        <Link href="/essentials">
          <CardContent className="relative">
            <Table>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-transparent">
                    <TableCell>
                      <Badge variant="outline">{item.quantity}</Badge>
                      <span className="pl-2">{item.title}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}
