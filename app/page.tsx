import { getUserAppsAction } from "@/actions/actions";
import { auth } from "@/auth";
import UserAvatar from "@/components/client/userAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { protocol, rootDomain } from "@/lib/utils";
import { ChevronRight, UserRound } from "lucide-react";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function App() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const apps = await getUserAppsAction();
  if (!apps || apps.length === 0) {
    redirect("/new-app");
  }
  return (
    <section className="flex flex-col gap-4 min-h-svh max-w-7xl mx-auto justify-center">
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
                <CardTitle className="flex justify-between items-center">
                  <p>{app.name}</p>
                </CardTitle>
                <CardDescription>{app.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Badge variant={"outline"} className="flex gap-1">
                    <UserRound absoluteStrokeWidth size={12} />
                    <p>{app._count.user}</p>
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
      {/* <p className="text-muted-foreground">{JSON.stringify(apps)}</p> */}
    </section>
  );
}
