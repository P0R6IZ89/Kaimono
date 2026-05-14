import { getAllAppsAction, requireSession } from "@/actions/appActions";
import DeleteDropdown from "@/components/client/deleteDropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link2, Plus, UserRound, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { UserManager } from "@/components/auth/userManage";
import { Separator } from "@/components/ui/separator";
import { protocol, rootDomain, rootDomainHost } from "@/lib/variables";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

type PageProps = { params: Promise<{ locale: string }> };

export default async function App({ params }: PageProps) {
  const { locale } = await params;
  const apps = await getAllAppsAction();
  const t = await getTranslations({ locale, namespace: "Teams" });
  return (
    <section className="flex flex-col py-16 px-8 gap-8 min-h-svh mx-auto max-w-3xl justify-center">
      <div className="mx-auto space-y-2">
        <Item variant={"default"}>
          <ItemMedia>
            <Users />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{t("title")}</ItemTitle>
            <ItemDescription>{t("description")}</ItemDescription>
          </ItemContent>
        </Item>
        {/* <UserManager user={session.user} className="w-fit" variant={"muted"} /> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-4">
        <Card className="p-0 justify-center outline-1 outline-dashed ring-0 bg-muted/50 border-transparent hover:outline-solid hover:outline-primary/50 hover:bg-accent/50 transition-colors">
          <Item>
            <ItemContent className="items-center text-center justify-center my-auto">
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
              <Card className="h-full p-0 gap-3 shadow-md justify-between border-transparent hover:outline-solid hover:outline-primary/50 hover:bg-accent/50 transition-colors">
                <Item className="">
                  <ItemContent>
                    <ItemTitle>{app.name}</ItemTitle>
                    <ItemDescription className="text-muted-foreground line-clamp-3">
                      {app.description}
                    </ItemDescription>
                    <AvatarGroup className="pt-2">
                      {app.memberships.slice(0, 3).map((membership, index) => (
                        <Avatar key={index} size="sm">
                          <AvatarImage
                            src={membership.user.image || undefined}
                            alt={membership.user.name || undefined}
                          />
                          <AvatarFallback>
                            {membership.user.name
                              ? membership.user.name.charAt(0).toUpperCase()
                              : membership.user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}

                      {app._count.memberships - 3 > 0 && (
                        <AvatarGroupCount>
                          +{app._count.memberships - 3}
                        </AvatarGroupCount>
                      )}
                    </AvatarGroup>
                  </ItemContent>

                  <ItemActions>
                    <DeleteDropdown id={app.id} />
                  </ItemActions>
                </Item>

                <CardContent className="pb-4">
                  <Badge
                    variant={"outline"}
                    className="flex flex-1 w-full justify-start gap-2"
                  >
                    <Link2 />
                    <span className="hover:underline line-clamp-1 truncate">
                      {app.subdomain}.{rootDomainHost}
                    </span>
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
