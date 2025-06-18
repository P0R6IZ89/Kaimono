import { auth } from "@/auth";
import React from "react";

async function UserName() {
  const session = await auth();

  return <div>{session?.user?.name}</div>;
}

export default UserName;
