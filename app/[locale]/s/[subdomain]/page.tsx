import React from "react";
import { getTranslations } from "next-intl/server";
import { HomeTopBar } from "./components/HomeTopBar";
import { getProjectWithFirstPlanned } from "@/actions/projectActions";

export default async function Essentials({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  const projects = await getProjectWithFirstPlanned(subdomain);

  const Home = [
    {
      id: "1",
      name: "Home",
      image: null,
    },
  ];

  const navItems = [...Home, ...projects];

  return (
    <div className="max-w-3xl flex flex-col overflow-x-auto mb-24 md:mb-0 p-4">
      <HomeTopBar projects={navItems} />
    </div>
  );
}
