import { requireMembership, requireSession } from "@/actions/appActions";
import { UserManager } from "@/components/auth/userManage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { ChevronsUpDown, User, User2 } from "lucide-react";

export default async function Settings({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const { user } = await requireSession();
  const membership = await requireMembership(subdomain);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 mb-24 md:mb-0">
      <div className="p-4">
        <p className="text-xl font-semibold px-4 py-2">Setting</p>
        <UserManager
          variant={"muted"}
          user={user}
          memberRole={membership.role}
          className={"w-full"}
        />
      </div>
      <p className="text-lg font-semibold">
        ⚠️ In Development - Em Desenvolvimento - 開発中のページです ⚠️
      </p>
      <div className="p-4">{/* <UserAvatar user={user} /> */}</div>
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
