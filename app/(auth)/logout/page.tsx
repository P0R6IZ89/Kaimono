import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function LogoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/home");
  }
  return (
    <div className=" flex flex-col gap-4 min-h-dvh max-w-lg m-auto justify-center items-center pl-8 pr-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Espero que você volte 🤗
        </h1>
        <p className="text-muted-foreground">
          Clique no botão para fazer logout.{" "}
        </p>
      </div>
      <div className="mt-4">
        <Button
          className="min-w-sm"
          onClick={async () => {
            "use server";
            await signOut();
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
