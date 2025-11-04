"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ redirect: false });
    router.push("/home");
  };

  return (
    <div className="flex flex-col gap-4 min-h-dvh max-w-lg m-auto justify-center items-center px-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Espero que você volte 🤗
        </h1>
        <p className="text-muted-foreground">
          Clique no botão para fazer logout.
        </p>
      </div>
      <div className="mt-4">
        <Button onClick={handleLogout} disabled={loading} className="min-w-sm">
          {loading ? "Saindo…" : "Logout"}
        </Button>
      </div>
    </div>
  );
}
