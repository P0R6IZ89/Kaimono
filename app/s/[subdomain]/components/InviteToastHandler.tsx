"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

export default function InviteToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // serialize so effect runs when query string actually changes
  const serialized = searchParams?.toString();

  useEffect(() => {
    if (!serialized) return;

    const params = new URLSearchParams(serialized);
    const invited = params.get("invited");
    const alreadyMember = params.get("alreadyMember");

    if (!invited && !alreadyMember) return;

    if (invited === "1") {
      toast.success("You’ve been added to the app.");
    } else if (alreadyMember === "1") {
      toast.info("You are already a member of this app.");
    }

    // remove the toast-related params without a full reload
    params.delete("invited");
    params.delete("alreadyMember");
    const newQuery = params.toString();
    const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [serialized, router]);

  return null;
}
