import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { UsersRound } from "lucide-react";

export function UsersInfo() {
  return (
    <Button variant={"ghost"} size={"icon"} className="relative size-7" asChild>
      <Link href={"/invite"}>
        <UsersRound className="text-muted-foreground" />
      </Link>
    </Button>
  );
}
