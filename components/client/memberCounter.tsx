import { getAllUserOfApp } from "@/actions/userActions";
import { getTranslations } from "next-intl/server";
import React from "react";

async function MemberCount({ subdomain }: { subdomain: string }) {
  const t = await getTranslations("MembersCard");
  const users = await getAllUserOfApp(subdomain);
  const members = users.length;
  return (
    <div className="flex gap-1 items-end">
      <p>{t("members-count", { members: members })}</p>
      {/* <p>{members}</p> {members > 1 ? "usuários" : "usuário"} */}
    </div>
  );
}

export default MemberCount;
