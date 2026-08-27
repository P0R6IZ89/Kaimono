import { requireSession } from "@/actions/appActions";
import { protocol, rootDomain } from "@/lib/variables";
import { redirect } from "next/navigation";

export default async function DemoLaunchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireSession();

  if (!session.isDemo || !session.demoSubdomain) {
    redirect(`/${locale}/`);
  }

  redirect(`${protocol}://${session.demoSubdomain}.${rootDomain}/${locale}`);
}
