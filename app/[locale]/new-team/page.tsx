import { redirect } from "@/i18n/navigation";

export default async function NewWorkspaceRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/new-workspace", locale });
}
