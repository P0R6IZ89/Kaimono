import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { protocol, rootDomain } from "@/util/utils";
import { acceptInviteAction } from "@/actions/invitationActions";
import ClientFeedback from "./clientFeedback";

interface AcceptPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({
  searchParams,
}: AcceptPageProps) {
  const { token } = await searchParams;
  if (!token) {
    return <ClientFeedback error="Missing invitation token." />;
  }

  const result = await acceptInviteAction(token);

  if (result.error) {
    return <ClientFeedback error={result.error} />;
  }

  const app = await prisma.app.findUnique({
    where: { id: result.appId },
    select: { subdomain: true },
  });
  if (!app?.subdomain) {
    return <ClientFeedback error="Invited app not found." />;
  }

  const params = new URLSearchParams();
  if (result.alreadyAccepted) {
    params.set("alreadyMember", "1");
  } else {
    params.set("invited", "1");
  }

  redirect(`${protocol}://${app.subdomain}.${rootDomain}?${params.toString()}`);
}
