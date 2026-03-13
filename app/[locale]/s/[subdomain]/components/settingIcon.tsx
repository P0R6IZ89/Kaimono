import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Settings } from "lucide-react";

export function SettingIcon() {
  return (
    <Button variant={"ghost"} size={"icon"} className="relative size-7" asChild>
      <Link href={"/settings"}>
        <Settings className="text-muted-foreground" />
      </Link>
    </Button>
  );
}
