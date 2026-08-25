import { requireMembership, requireSession } from "@/actions/appActions";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import {
  AI_CREDIT_PACKS,
  FREE_SIGNUP_CREDITS,
  getAiCreditBalance,
} from "@/lib/ai-credits";
import { getTranslations } from "next-intl/server";
import { CreditPackActions } from "./credit-pack-actions";
import { AiCreditToastHandler } from "./ai-credit-toast-handler";
import { RefreshBalanceButton } from "./refresh-balance-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

export default async function AiCreditsSettingsPage({
  params,
}: {
  params: Promise<{ subdomain: string; locale: string }>;
}) {
  const { subdomain, locale } = await params;
  const { user } = await requireSession();
  await requireMembership(subdomain);
  const t = await getTranslations("Settings");
  const credits = await getAiCreditBalance(user.id);
  const packs = [
    {
      id: AI_CREDIT_PACKS.starter.id,
      label: t("aiCredits.starterPack"),
    },
    {
      id: AI_CREDIT_PACKS.value.id,
      label: t("aiCredits.valuePack"),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 pt-8 mb-24 md:mb-0">
      <AiCreditToastHandler />
      <div>
        <Alert className="mb-4 border-0" variant="default">
          <AlertCircle color="green" />
          <AlertTitle>{t("aiCredits.purchaseNoticeTitle")}</AlertTitle>
          <AlertDescription>
            {t.rich("aiCredits.purchaseNoticeDescription", {
              contact: (chunks) => (
                <Link
                  href="/settings/contact"
                  className="underline text-foreground"
                >
                  {chunks}
                </Link>
              ),
            })}
          </AlertDescription>
        </Alert>
        <ItemGroup className="bg-muted/50 border rounded-sm gap-0">
          <Item className="p-4">
            <ItemContent className="gap-2">
              <Badge variant="outline" className="">
                {t("aiCredits.signupBonus", {
                  count: FREE_SIGNUP_CREDITS,
                })}
              </Badge>
              <ItemTitle className="text-base">
                <p>{t("aiCredits.remainingTitle")}</p>
              </ItemTitle>
              <p className="text-4xl font-semibold tracking-normal">
                {t("aiCredits.remainingCount", { count: credits })}
              </p>
              {/* <p className="text-sm text-muted-foreground">
                {t("aiCredits.description")}
              </p> */}
              <RefreshBalanceButton />
            </ItemContent>
          </Item>
        </ItemGroup>
      </div>

      <div>
        <p className="py-2">{t("aiCredits.addCredits")}</p>
        <ItemGroup className=" w-1/2 bg-muted/50 border rounded-sm gap-0">
          <Item className="p-4">
            <ItemContent className="gap-3">
              <ItemTitle>{t("aiCredits.packsTitle")}</ItemTitle>
              <p className="text-sm text-muted-foreground">
                {t("aiCredits.costNote")}
              </p>
              <CreditPackActions
                packs={packs}
                subdomain={subdomain}
                locale={locale}
              />
            </ItemContent>
          </Item>
        </ItemGroup>
      </div>
    </div>
  );
}
