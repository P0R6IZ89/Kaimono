import { ChevronRight, Layers } from "lucide-react";
import React from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { countAllProjects } from "@/actions/projectActions";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

async function QuickProjectCard({ subdomain }: { subdomain: string }) {
  const count = await countAllProjects(subdomain);
  const t = await getTranslations("ProjectsPage");

  return (
    <div className="flex items-stretch gap-2">
      <Item className="flex-1" asChild>
        <Link href={"/projects"} prefetch={true}>
          <ItemMedia
            className="text-background dark:text-foreground rounded-md p-1.5 bg-amber-600"
            variant={"icon"}
          >
            <Layers />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{t("title")}</ItemTitle>
          </ItemContent>
          <ItemActions>
            {count !== 0 && <Badge variant="outline">{count}</Badge>}
          </ItemActions>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </Item>
      {/* <ProjectCreateDialog
        className="p-2 h-full aspect-square rounded-md"
        buttonVariant="outline"
        subdomain={subdomain}
      >
        <Plus />
      </ProjectCreateDialog> */}
    </div>
  );
}

export default QuickProjectCard;
