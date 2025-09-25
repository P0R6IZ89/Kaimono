"use client";

import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { signOutAction } from "@/actions/authActions";

export function SignOut() {
  return (
    <form action={signOutAction} className="w-full">
      <Button variant={"ghost"} type="submit">
        <LogOut />
        Log out
      </Button>
    </form>
  );
}
