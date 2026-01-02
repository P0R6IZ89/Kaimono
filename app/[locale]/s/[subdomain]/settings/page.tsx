import { requireSession } from "@/actions/appActions";
import { Separator } from "@/components/ui/separator";
import { User2 } from "lucide-react";

export default async function Settings() {
  const session = await requireSession();
  // const [apps, currentApp] = await Promise.all([
  //   getAllAppsAction(),
  //   getCurrentAppAction(subdomain),
  // ]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 mb-24 md:mb-0">
      <p className="text-lg font-semibold">
        ⚠️ In Development - Em Desenvolvimento - 開発中のページです ⚠️
      </p>
      <div className="p-4">{/* <UserAvatar user={session.user} /> */}</div>
      <div className="p-4">
        {/* <AppSwitcher apps={apps} currentApp={currentApp} /> */}
      </div>
      <p>user</p>
      <p>role</p>
      <p>Image</p>
      <p>email</p>
      <p>logout</p>
      <Separator />
      <p>App</p>
      <p>App image</p>
      <p>App Name</p>
      <p>App link</p>
      <p>Add new app</p>
      <Separator />

      <User2 />
      <p>invite user</p>
      <Separator />

      <p>Help</p>
      <p>tutorial</p>
      <Separator />

      <p>Support</p>
      <p>Donate</p>
    </div>
  );
}
