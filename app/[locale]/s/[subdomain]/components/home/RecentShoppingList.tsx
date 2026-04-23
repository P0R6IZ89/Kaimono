import { Card, CardContent } from "@/components/ui/card";
import { recentShoppingItemsType } from "../HomeContent";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

export function RecentShoppingList({
  items,
}: {
  items: recentShoppingItemsType;
}) {
  if (items.length === 0) {
    return null;
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
