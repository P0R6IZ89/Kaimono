import { getAllAppsAction, requireSession } from "@/actions/appActions";
import DeleteDropdown from "@/components/client/deleteDropdown";
import UserAvatar from "@/components/auth/userAvatar";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { protocol, rootDomain } from "@/util/utils";
import { Info, Plus, UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RelativeTime } from "./components/relativeTime";

type PageProps = { params: Promise<{ locale: string }> };

export default async function App({ params }: PageProps) {
  const { locale } = await params;
  const session = await requireSession();
  const apps = await getAllAppsAction();
  const t = await getTranslations({ locale, namespace: "Apps" });
  return (
    <section className="container flex flex-col py-16 px-4 gap-4 min-h-svh mx-auto justify-center">
      <div className="space-y-4">
        <div>
          <p className=" text-center text-xl font-bold leading-tight tracking-tighter">
            {t("title")}
          </p>
          <p className="text-center text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex justify-center items-center">
          <Button asChild size={"sm"} className="">
            <span className="flex items-center">
              <Link href="/new-app">{t("create-app")}</Link>
              <Plus />
            </span>
          </Button>
        </div>

        <div className="flex">
          <UserAvatar user={session.user} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 justify-start gap-4 pt-4">
        {apps.length === 0 ? (
          <Alert className="max-w-500">
            <Info />
            <AlertTitle>{t("start-adding-a-new-app")}</AlertTitle>
          </Alert>
        ) : null}
        {apps.map((app) => {
          return (
            <Link
              key={app.id}
              href={`${protocol}://${app.subdomain}.${rootDomain}/${locale}`}
            >
              <Card className="flex flex-col justify-between max-w-500 hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle>
                    <p className="capitalize">{app.name}</p>
                    <p className="pt-1 text-xs font-medium text-muted-foreground">
                      <RelativeTime date={app.createdAt} />
                    </p>
                  </CardTitle>
                  <CardDescription>{app.description}</CardDescription>
                  <CardAction>
                    <DeleteDropdown id={app.id} />
                  </CardAction>
                </CardHeader>
                <CardContent>
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
                        {app.subdomain}.{rootDomain}
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
