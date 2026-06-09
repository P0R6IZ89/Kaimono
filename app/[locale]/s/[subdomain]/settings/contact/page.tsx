import { requireMembership } from "@/actions/appActions";
import { ContactForm } from "./contact-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const { session } = await requireMembership(subdomain);
  const t = await getTranslations({ locale, namespace: "Contact" });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm
            subdomain={subdomain}
            defaultFullName={session.user.name ?? ""}
            defaultEmail={session.user.email}
          />
        </CardContent>
      </Card>
    </div>
  );
}
