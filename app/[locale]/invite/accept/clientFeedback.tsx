"use client";

import { useEffect } from "react";
import { toast } from "sonner";

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
      <h1 className="text-2xl font-bold mb-2">Emissão de convites</h1>
      <p className="mb-4">
        {error || "Something went wrong while processing the invite."}
      </p>
    </div>
  );
}
