import { requireSession } from "@/actions/appActions";
import UserAvatar from "@/components/auth/userAvatar";

export default async function Settings() {
  const session = await requireSession();
  // const [apps, currentApp] = await Promise.all([
  //   getAllAppsAction(),
  //   getCurrentAppAction(subdomain),
  // ]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 mb-24 md:mb-0">
      <div className="p-4">
        <UserAvatar user={session.user} />
      </div>
      <div className="p-4">
        {/* <AppSwitcher apps={apps} currentApp={currentApp} /> */}
      </div>
      <p>Converting caffeine in code... pls be patient...</p>
    </div>
  );
}
