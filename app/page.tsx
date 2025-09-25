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
import { protocol, rootDomain } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChevronRight, Info, UserRound } from "lucide-react";
import Link from "next/link";

dayjs.extend(relativeTime);

export default async function App() {
  const session = await requireSession()
  const apps = await getAllAppsAction();
  console.log();
  return (
    <section className="container flex flex-col py-16 px-4 gap-4 min-h-svh mx-auto justify-center">
      <div className="space-y-4">
        <div>
          <p className="text-xl font-bold leading-tight tracking-tighter">
            Apps
          </p>
          <p className="text-muted-foreground">
            Gerencie todo o seu aplicativo a partir daqui
          </p>
        </div>
        <Button asChild size={"sm"}>
          <Link href="/new-app">Criar App</Link>
        </Button>

        <div className="flex">
          <UserAvatar user={session.user} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 justify-start gap-4 pt-4">
        {apps.length === 0 ? (
          <Alert className="max-w-[500px]">
            <Info />
            <AlertTitle>Comece adicionando um novo aplicativo!</AlertTitle>
          </Alert>
        ) : null}
        {apps.map((app) => {
          return (
            <Card
              key={app.id}
              className="flex flex-col justify-between max-w-[500px]"
            >
              <CardHeader>
                <CardTitle>
                  <p className="capitalize">{app.name}</p>
                  <p className="pt-1 text-xs font-medium text-muted-foreground">
                    {dayjs(app.createdAt).fromNow()}
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
                    <Link href={`${protocol}://${app.subdomain}.${rootDomain}`}>
                      <span className="hover:underline line-clamp-1 truncate">
                        {app.subdomain}.{rootDomain}
                      </span>
                    </Link>
                    <ChevronRight absoluteStrokeWidth size={12} />
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
