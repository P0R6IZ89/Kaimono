import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { acceptInviteAction } from "@/actions/invitationActions";
import ClientFeedback from "./clientFeedback";
import { protocol, rootDomain } from "@/lib/variables";

interface AcceptPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({
  searchParams,
}: AcceptPageProps) {
  const { token } = await searchParams;
  const session = await auth();
  const currentUser = session?.user?.email
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : undefined;

  if (!token) {
    return <ClientFeedback error="missingToken" user={currentUser} />;
  }

  const result = await acceptInviteAction(token);

  if (result.error) {
    return <ClientFeedback error={result.error} user={currentUser} />;
  }

  const app = await prisma.app.findUnique({
    where: { id: result.appId },
    select: { subdomain: true },
  });
  if (!app?.subdomain) {
    return <ClientFeedback error="appNotFound" user={currentUser} />;
  }

  const params = new URLSearchParams();
  if (result.alreadyAccepted) {
    params.set("alreadyMember", "1");
  } else {
    params.set("invited", "1");
  }

  redirect(`${protocol}://${app.subdomain}.${rootDomain}?${params.toString()}`);
}
