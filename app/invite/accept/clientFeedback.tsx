"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface Props {
  error?: string;
}

export default function ClientFeedback({ error }: Props) {
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="max-w-md mx-auto mt-28 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-2">Invitation Issue</h1>
      <p className="mb-4">
        {error || "Something went wrong while processing the invite."}
      </p>
      <div className="flex gap-3">
        <Link
          href="/new-app"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create new app
        </Link>
        <Link href="/support" className="px-4 py-2 border rounded">
          Contact support
        </Link>
      </div>
    </div>
  );
}
