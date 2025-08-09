import { getAllUserOfApp } from "@/actions/userActions";
import React from "react";

async function MemberCount({ subdomain }: { subdomain: string }) {
  const users = await getAllUserOfApp(subdomain);
  const members = users.length;
  return (
    <div className="flex gap-1 items-end">
      <p>{members}</p> {members > 1 ? "usuários" : "usuário"}
    </div>
  );
}

export default MemberCount;
