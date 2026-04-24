import React from "react";
import { getEssentialsBySubdomain } from "@/actions/essentialsActions";
import { requireSession } from "@/actions/appActions";
import { ChatField } from "./chat-field";
import { AddItem } from "./add-item";

interface EssentialsProps {
  params: Promise<{ subdomain: string; locale: string }>;
}

export default async function Essentials({ params }: EssentialsProps) {
  const { subdomain } = await params;
  const session = await requireSession();
  const essentials = await getEssentialsBySubdomain(subdomain);

  return (
    <section className="flex h-[calc(100svh-var(--header-height)-env(safe-area-inset-bottom)-80px)] min-h-0 flex-col gap-2 overflow-hidden p-4 md:h-[calc(100svh-var(--header-height)-1rem)] md:gap-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-sidebar rounded-md">
        <ChatField essentials={essentials} currentUserId={session.user.id} />
      </div>
      <div className="flex shrink-0 flex-row gap-2">
        <AddItem />
      </div>
    </section>
  );
}
