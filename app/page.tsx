import { getAllAppsAction } from "@/actions/appActions";
import DeleteDropdown from "@/components/client/deleteDropdown";
import UserAvatar from "@/components/client/userAvatar";
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
import { ChevronRight, UserRound } from "lucide-react";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";

dayjs.extend(relativeTime);

export default async function App() {
  const apps = await getAllAppsAction();
  return (
    <section className="flex flex-col py-16 px-4 gap-4 min-h-svh max-w-7xl mx-auto justify-center">
      <SessionProvider>
        <div className="flex">
          <UserAvatar />
        </div>
      </SessionProvider>
      <div className="space-y-4">
        <div>
          <p className="text-4xl font-bold leading-tight tracking-tighter">
            Apps
          </p>
          <p className="max-w-md text-muted-foreground">
            Gerencie todo o seu aplicativo a partir daqui
          </p>
        </div>

        <Button asChild size={"sm"}>
          <Link href="/new-app">Criar App</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-start gap-4 pt-4">
        {apps.map((app) => {
          return (
            <Card key={app.id} className="flex flex-col justify-between">
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
