import { auth } from "@/auth";
import React from "react";

async function UserName() {
  const session = await auth();

  return <>{session?.user?.name ?? session?.user?.name}</>;
}

export default UserName;
