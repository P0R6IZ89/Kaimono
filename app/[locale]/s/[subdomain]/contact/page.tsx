import { redirect } from "@/i18n/navigation";

export default async function ContactRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/settings/contact", locale });
}
