import { getAllUserOfApp } from "@/actions/userActions";
import React from "react";

async function MemberCount({
  subdomain,
  className,
}: {
  subdomain: string;
  className: string | undefined;
}) {
  const users = await getAllUserOfApp(subdomain);
  const members = users.length;
  return (
    <div className={className}>
      {members} {members > 1 ? "usuários" : "usuário"}
    </div>
  );
}

export default MemberCount;
