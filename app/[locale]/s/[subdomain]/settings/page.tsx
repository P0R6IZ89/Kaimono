import {
  getAllAppsAction,
  getCurrentAppAction,
  requireMembership,
  requireSession,
} from "@/actions/appActions";
import { UserManager } from "@/components/auth/userManage";
import { KoFiPlainButton } from "@/components/kofi/KoFiWidget";
import { AppSwitcher } from "@/components/sidebar/apps-switcher";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Link } from "@/i18n/navigation";
import { ChevronRight, GraduationCap, UserPlus2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import ThemeToggler from "./theme";
import { protocol, rootDomain } from "@/lib/variables";

export default async function Settings({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const { user } = await requireSession();
  const membership = await requireMembership(subdomain);
  const apps = await getAllAppsAction();
  const currentApp = await getCurrentAppAction(subdomain);
  const t = await getTranslations("Settings");

  return (
    <div className="grid grid-cols-1 gap-4 mb-24 md:mb-0 px-4 pt-8">
      <div>
        <p className="py-2">{t("account")}</p>
        <UserManager
          variant={"outline"}
          user={user}
          memberRole={membership.role}
          className={"w-full bg-muted/50"}
        />
      </div>
      <div>
        <p className="py-2">{t("team")}</p>
        <ItemGroup className="bg-muted/50 border rounded-sm gap-0">
          <AppSwitcher apps={apps} currentApp={currentApp} />
          <Item className="p-2 gap-4" asChild>
            <Link href={"/invite"}>
              <ItemMedia
                variant={"icon"}
                className="bg-muted rounded-lg size-8"
              >
                <UserPlus2 />
              </ItemMedia>
              <ItemContent className="gap-0">
                <ItemTitle>{t("inviteMembers")}</ItemTitle>
                <ItemDescription className="text-xs">
                  {t("inviteDescription")}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        </ItemGroup>
      </div>
      <div>
        <p className="py-2">{t("help")}</p>
        <ItemGroup className="bg-muted/50 border rounded-sm gap-0">
          <Item className="p-2 gap-4" asChild>
            <Link href={`${protocol}://${rootDomain}/${locale}/home`}>
              <ItemMedia
                variant={"icon"}
                className="bg-muted rounded-lg size-8"
              >
                <GraduationCap />
              </ItemMedia>
              <ItemContent className="gap-0">
                <ItemTitle>{t("homeTitle")}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-4" />
              </ItemActions>
            </Link>
          </Item>
        </ItemGroup>
      </div>
      <div>
        <p className="py-2">{t("appearance")}</p>
        <ItemGroup className="bg-muted/50 border rounded-sm gap-0">
          <ThemeToggler className="p-2 gap-4" />
        </ItemGroup>
      </div>

      <div>
        <p className="py-2">{t("support")}</p>
        <KoFiPlainButton className={"w-full"} />
      </div>
      <div className="flex justify-center">
        <p className="text-xs text-muted-foreground">
          {t("developedBy", { name: "Alam Sawamme" })}
        </p>
      </div>
    </div>
  );
}
