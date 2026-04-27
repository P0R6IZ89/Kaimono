import { auth } from "@/auth";
import { userHasApps } from "@/actions/appActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FolderKanban,
  ListChecks,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  ShoppingCart,
  UsersRound,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

type PageProps = { params: Promise<{ locale: string }> };

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const session = await auth();
  const hasApps = session?.user ? await userHasApps() : false;

  const primaryCta = session?.user
    ? hasApps
      ? { href: "/", label: t("cta.dashboard") }
      : { href: "/new-team", label: t("cta.createTeam") }
    : { href: "/login", label: t("cta.signIn") };

  const features = [
    {
      icon: UsersRound,
      title: t("features.teams.title"),
      description: t("features.teams.description"),
    },
    {
      icon: ShoppingCart,
      title: t("features.essentials.title"),
      description: t("features.essentials.description"),
    },
    {
      icon: ListChecks,
      title: t("features.planned.title"),
      description: t("features.planned.description"),
    },
    {
      icon: FolderKanban,
      title: t("features.projects.title"),
      description: t("features.projects.description"),
    },
    {
      icon: MessageSquareText,
      title: t("features.collaboration.title"),
      description: t("features.collaboration.description"),
    },
    {
      icon: Bot,
      title: t("features.ai.title"),
      description: t("features.ai.description"),
      badge: t("features.ai.badge"),
    },
  ];

  const workflow = [
    {
      step: "01",
      title: t("workflow.create.title"),
      description: t("workflow.create.description"),
    },
    {
      step: "02",
      title: t("workflow.capture.title"),
      description: t("workflow.capture.description"),
    },
    {
      step: "03",
      title: t("workflow.organize.title"),
      description: t("workflow.organize.description"),
    },
    {
      step: "04",
      title: t("workflow.collaborate.title"),
      description: t("workflow.collaborate.description"),
    },
  ];

  const trustItems = [
    {
      icon: ShieldCheck,
      title: t("trust.tenant.title"),
      description: t("trust.tenant.description"),
    },
    {
      icon: LockKeyhole,
      title: t("trust.roles.title"),
      description: t("trust.roles.description"),
    },
    {
      icon: UsersRound,
      title: t("trust.invitations.title"),
      description: t("trust.invitations.description"),
    },
  ];

  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto flex min-h-[82svh] w-full max-w-6xl flex-col justify-center px-6 py-16 md:px-10">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-5">
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-balance md:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              {t("hero.description")}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-fit">
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-fit"
            >
              <Link href="#features">{t("cta.features")}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-14 grid gap-3 border-y py-5 text-sm text-muted-foreground md:grid-cols-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {t("hero.points.workspace")}
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {t("hero.points.planning")}
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {t("hero.points.collaboration")}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10"
      >
        <div className="mb-8 max-w-2xl space-y-3">
          <Badge variant="secondary" className="w-fit">
            {t("features.badge")}
          </Badge>
          <h2 className="text-3xl font-semibold tracking-normal">
            {t("features.title")}
          </h2>
          <p className="leading-7 text-muted-foreground">
            {t("features.description")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="h-full">
                <CardHeader className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    {feature.badge ? (
                      <Badge variant="outline" className="text-xs">
                        {feature.badge}
                      </Badge>
                    ) : null}
                  </div>
                  <CardDescription className="leading-6">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit">
              {t("workflow.badge")}
            </Badge>
            <h2 className="text-3xl font-semibold tracking-normal">
              {t("workflow.title")}
            </h2>
            <p className="leading-7 text-muted-foreground">
              {t("workflow.description")}
            </p>
          </div>

          <div className="space-y-4">
            {workflow.map((item) => (
              <div
                key={item.step}
                className="grid gap-4 rounded-lg border bg-card p-5 sm:grid-cols-[4rem_1fr]"
              >
                <div className="text-sm font-medium text-muted-foreground">
                  {item.step}
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <div className="rounded-xl border bg-muted/40 p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit">
                {t("trust.badge")}
              </Badge>
              <h2 className="text-2xl font-semibold tracking-normal">
                {t("trust.title")}
              </h2>
              <p className="leading-7 text-muted-foreground">
                {t("trust.description")}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {trustItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="space-y-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="space-y-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <Separator className="mb-12" />
        <Card className="border-primary/20 bg-primary text-primary-foreground">
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl font-semibold tracking-normal">
                {t("finalCta.title")}
              </h2>
              <p className="leading-7 text-primary-foreground/80">
                {t("finalCta.description")}
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="shrink-0">
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
