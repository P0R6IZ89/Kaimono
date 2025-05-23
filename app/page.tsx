import { getAppsAction } from "@/actions/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { rootDomain } from "@/lib/utils";
import { ChevronRight, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function App() {
  const apps = await getAppsAction();
  if (!apps) {
    redirect("/new-app");
  }
  return (
    <main className="flex flex-col pt-16 min-h-svh max-w-7xl mx-auto justify-center">
      <section className="px-4">
        <p className="text-4xl font-bold leading-tight tracking-tighter">
          Apps
        </p>
        <p className="max-w-md text-muted-foreground">
          Gerencie todo o seu aplicativo a partir daqui
        </p>
        <div className="pt-2 pb-4">
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
                    {/* <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"}>
                          <Ellipsis size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <Settings />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash2 />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                  </CardTitle>
                  <CardDescription>
                    {app.description}
                    {/* <p className="w-full">{JSON.stringify(app, null, "\n")}</p> */}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Badge variant={"outline"} className="flex gap-1">
                      <UserRound absoluteStrokeWidth size={12} />
                      <p>{app.user.length}</p>
                    </Badge>
                    <Badge
                      variant={"outline"}
                      className="flex flex-1 justify-between"
                    >
                      <Link href={`https://${app.subdomain}.${rootDomain}`}>
                        <span className="hover:underline">
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
    </main>
  );
}
