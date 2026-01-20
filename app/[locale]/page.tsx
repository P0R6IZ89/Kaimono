import { getAllAppsAction, requireSession } from "@/actions/appActions";
import DeleteDropdown from "@/components/client/deleteDropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { protocol, rootDomain, rootDomainHost } from "@/util/utils";
import { Folder, Plus, UserRound, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RelativeTime } from "./components/relativeTime";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { UserManager } from "@/components/auth/userManage";

type PageProps = { params: Promise<{ locale: string }> };

export default async function App({ params }: PageProps) {
  const { locale } = await params;
  const session = await requireSession();
  const apps = await getAllAppsAction();
  const t = await getTranslations({ locale, namespace: "Teams" });
  return (
    <section className="flex flex-col py-16 px-8 gap-8 min-h-svh mx-auto justify-center">
      <div className="mx-auto space-y-2">
        <Item variant={"default"} className="">
          <ItemMedia>
            <Users />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{t("title")}</ItemTitle>
            <ItemDescription className="line-clamp-none">
              {t("description")}
            </ItemDescription>
          </ItemContent>
        </Item>
        <div className="flex">
          <UserManager user={session.user} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        <Card className="p-0 gap-3 justify-between outline-1 outline-dashed ring-0 bg-muted/50 border-transparent hover:outline-solid hover:outline-primary/50 hover:bg-accent/50 transition-colors">
          <Item className="">
            <ItemMedia variant={"default"}>
              <Folder />
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>{t("new-team-card.title")}</ItemTitle>
              <ItemDescription>
                {t("new-team-card.description")}
              </ItemDescription>
            </ItemContent>
          </Item>

          <CardContent className="pb-4">
            <Button asChild className="w-full" variant={"outline"} size={"sm"}>
              <span className="flex items-center">
                <Plus />
                <Link href="/new-team">{t("create-team")}</Link>
              </span>
            </Button>
          </CardContent>
        </Card>

        {apps.map((app) => {
          return (
            <Link
              key={app.id}
              href={`${protocol}://${app.subdomain}.${rootDomain}/${locale}`}
              className="w-full h-full"
            >
              <Card className="p-0 gap-3 justify-between border-transparent hover:outline-solid hover:outline-primary/50 hover:bg-accent/50 transition-colors">
                <Item className="">
                  <ItemMedia variant={"default"}>
                    <Folder />
                  </ItemMedia>
                  <ItemContent className="gap-0">
                    <ItemTitle>{app.name}</ItemTitle>
                    <ItemDescription className="text-xs">
                      <RelativeTime date={app.createdAt} />
                    </ItemDescription>
                    <ItemDescription className="text-foreground pt-2">
                      {app.description}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <DeleteDropdown id={app.id} />
                  </ItemActions>
                </Item>

                <CardContent className="pb-4">
                  <div className="flex space-x-2">
                    <Badge variant={"outline"} className="flex gap-1">
                      <UserRound absoluteStrokeWidth size={12} />
                      <p>{app._count.memberships}</p>
                    </Badge>
                    <Badge
                      variant={"outline"}
                      className="flex flex-1 justify-between"
                    >
                      <span className="hover:underline line-clamp-1 truncate">
                        {app.subdomain}.{rootDomainHost}
                      </span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
