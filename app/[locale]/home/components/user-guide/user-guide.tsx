import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { StepCard, FeatureHighlight, QuickAction } from "./guide-components";
import {
  BookOpen,
  Rocket,
  ShoppingCart,
  FolderOpen,
  Users,
  Lightbulb,
  Plus,
  Home,
  Settings,
  Star,
  Target,
  BarChart3,
  TrendingUp,
  GitBranch,
  Check,
  Sparkles,
  User,
  Shirt,
  Armchair,
} from "lucide-react";
import { requireSession, userHasApps } from "@/actions/appActions";
import { getTranslations } from "next-intl/server";

export default async function UserGuide() {
  // const { data: session } =  useSession();
  const session = await requireSession();
  const hasApps = await userHasApps();
  // const t = useTranslations("UserGuide");
  const t = await getTranslations("UserGuide");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="py-40 space-y-1">
            <Badge variant="outline" className="mb-6 text-base px-4 py-2">
              <Check className="inline-block mr-2 h-4 w-4 text-green-500" />
              {t("hero.title")}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter ">
              {t("hero.subtitle")}
            </h1>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("hero.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <FeatureHighlight
              title={t("hero.features.visualization.title")}
              description={t("hero.features.visualization.description")}
              icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
            />
            <FeatureHighlight
              title={t("hero.features.decisions.title")}
              description={t("hero.features.decisions.description")}
              icon={<TrendingUp className="h-6 w-6 text-green-500" />}
            />
            <FeatureHighlight
              title={t("hero.features.organization.title")}
              description={t("hero.features.organization.description")}
              icon={<GitBranch className="h-6 w-6 text-purple-500" />}
            />
            <FeatureHighlight
              title={t("hero.features.collaboration.title")}
              description={t("hero.features.collaboration.description")}
              icon={<Users className="h-6 w-6 text-orange-500" />}
            />
          </div>

          <Card className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8 text-center">
              <h3 className="inline-flex gap-2 text-xl font-semibold mb-3">
                <Sparkles />
                {t("hero.useCase.title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {t("hero.useCase.description")}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6 mt-12">
            <div className="flex flex-wrap gap-4 justify-center">
              <QuickAction
                title={t("hero.startGuide")}
                description={t("hero.transition")}
                icon={<BookOpen className="h-5 w-5" />}
                href="#getting-started"
              />
              <QuickAction
                title={t("hero.viewDashboard")}
                description={t("hero.goToDashboard")}
                icon={<Home className="h-5 w-5" />}
                href="/"
                variant="outline"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container pt-4 mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <Card id="getting-started" className="overflow-hidden">
            <CardHeader className="">
              <div className="flex items-center gap-3">
                <Rocket className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl">
                  {t("gettingStarted.title")}
                </CardTitle>
              </div>
              <CardDescription>
                {t("gettingStarted.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <StepCard
                  step={1}
                  isCompleted={session?.user ? true : false}
                  title={t("gettingStarted.step1.title")}
                  description={t("gettingStarted.step1.description")}
                  icon={<User className="h-5 w-5" />}
                />
                <StepCard
                  step={2}
                  isCompleted={hasApps}
                  title={t("gettingStarted.step2.title")}
                  description={t("gettingStarted.step2.description")}
                  actionText={t("gettingStarted.step2.action")}
                  actionLink="/new-app"
                  icon={<FolderOpen className="h-5 w-5" />}
                />
                <StepCard
                  step={3}
                  isCompleted={hasApps}
                  title={t("gettingStarted.step3.title")}
                  description={t("gettingStarted.step3.description")}
                  actionText={t("gettingStarted.step3.action")}
                  actionLink="/"
                  icon={<Home className="h-5 w-5" />}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-indigo-600" />
                <CardTitle className="text-2xl">
                  {t("coreFeatures.title")}
                </CardTitle>
              </div>
              <CardDescription>{t("coreFeatures.description")}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Accordion
                type="multiple"
                defaultValue={["essentials", "projects"]}
                className="space-y-4"
              >
                <AccordionItem
                  value="essentials"
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Shirt className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">
                        {t("coreFeatures.essentials.title")}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {t("coreFeatures.essentials.description")}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FeatureHighlight
                          title={t("coreFeatures.essentials.quickAdd.title")}
                          description={t(
                            "coreFeatures.essentials.quickAdd.description"
                          )}
                          icon={<Plus className="h-4 w-4 text-green-500" />}
                          example={t(
                            "coreFeatures.essentials.quickAdd.example"
                          )}
                        />
                        <FeatureHighlight
                          title={t(
                            "coreFeatures.essentials.statusTracking.title"
                          )}
                          description={t(
                            "coreFeatures.essentials.statusTracking.description"
                          )}
                          icon={<Star className="h-4 w-4 text-yellow-500" />}
                          example={t(
                            "coreFeatures.essentials.statusTracking.example"
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="planned"
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Armchair className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold">
                        {t("coreFeatures.planned.title")}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {t("coreFeatures.planned.description")}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FeatureHighlight
                          title={t("coreFeatures.planned.priorityLevels.title")}
                          description={t(
                            "coreFeatures.planned.priorityLevels.description"
                          )}
                          icon={<Target className="h-4 w-4 text-red-500" />}
                          example={t(
                            "coreFeatures.planned.priorityLevels.example"
                          )}
                        />
                        <FeatureHighlight
                          title={t("coreFeatures.planned.richDetails.title")}
                          description={t(
                            "coreFeatures.planned.richDetails.description"
                          )}
                          icon={
                            <Lightbulb className="h-4 w-4 text-purple-500" />
                          }
                          example={t(
                            "coreFeatures.planned.richDetails.example"
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="projects"
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <FolderOpen className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">
                        {t("coreFeatures.projects.title")}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {t("coreFeatures.projects.description")}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FeatureHighlight
                          title={t("coreFeatures.projects.kanbanBoard.title")}
                          description={t(
                            "coreFeatures.projects.kanbanBoard.description"
                          )}
                          icon={<Settings className="h-4 w-4 text-blue-500" />}
                          example={t(
                            "coreFeatures.projects.kanbanBoard.example"
                          )}
                        />
                        <FeatureHighlight
                          title={t("coreFeatures.projects.projectBased.title")}
                          description={t(
                            "coreFeatures.projects.projectBased.description"
                          )}
                          icon={
                            <FolderOpen className="h-4 w-4 text-green-500" />
                          }
                          isPro={true}
                          example={t(
                            "coreFeatures.projects.projectBased.example"
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-500" />
                <CardTitle className="text-2xl">
                  {t("collaboration.title")}
                </CardTitle>
              </div>
              <CardDescription>
                {t("collaboration.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <FeatureHighlight
                    title={t("collaboration.owner.title")}
                    description={t("collaboration.owner.description")}
                    icon={<Users className="h-4 w-4 text-red-500" />}
                  />
                  <FeatureHighlight
                    title={t("collaboration.admin.title")}
                    description={t("collaboration.admin.description")}
                    icon={<Users className="h-4 w-4 text-orange-500" />}
                  />
                  <FeatureHighlight
                    title={t("collaboration.member.title")}
                    description={t("collaboration.member.description")}
                    icon={<Users className="h-4 w-4 text-blue-500" />}
                  />
                </div>

                <StepCard
                  step={1}
                  title={t("collaboration.inviteStep.title")}
                  description={t("collaboration.inviteStep.description")}
                  icon={<Users className="h-5 w-5 " />}
                />
                <StepCard
                  step={2}
                  title={t("collaboration.collaborateStep.title")}
                  description={t("collaboration.collaborateStep.description")}
                  icon={<Lightbulb className="h-5 w-5 " />}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">{t("cta.title")}</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                {t("cta.description")}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/new-app">
                    <Plus className="mr-2 h-5 w-5" />
                    {t("cta.createApp")}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                >
                  <Link href="/">
                    <Home className="mr-2 h-5 w-5" />
                    {t("cta.viewDashboard")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
