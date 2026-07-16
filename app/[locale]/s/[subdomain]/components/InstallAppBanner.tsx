"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const dismissedSessionKey = "kaimono-install-banner-dismissed";

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function InstallAppBanner() {
  const t = useTranslations("InstallAppBanner");
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [ios, setIOS] = useState(false);

  useEffect(() => {
    if (
      isStandalone() ||
      sessionStorage.getItem(dismissedSessionKey) === "true"
    ) {
      return;
    }

    const runningOnIOS = isIOS();
    setIOS(runningOnIOS);
    setShowBanner(true);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setShowBanner(false);
      setInstallEvent(null);
      sessionStorage.removeItem(dismissedSessionKey);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (ios || !installEvent) {
      setShowInstallInstructions(true);
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;

    setInstallEvent(null);
    setShowBanner(false);
  }

  function handleDismiss() {
    setShowBanner(false);
    sessionStorage.setItem(dismissedSessionKey, "true");
  }

  if (!showBanner) return null;

  return (
    <>
      <aside aria-label={t("title")} className="mb-2 w-full">
        <Item variant="muted" size="sm" className="flex-nowrap">
          <ItemMedia variant="icon" className="text-primary">
            <Download aria-hidden="true" />
          </ItemMedia>
          <ItemContent className="min-w-0">
            <ItemTitle className="block w-full truncate">
              {t("description")}
            </ItemTitle>
          </ItemContent>
          <ItemActions className="shrink-0 gap-1">
            <Button
              type="button"
              size="xs"
              variant="default"
              onClick={handleInstall}
            >
              {t("install")}
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label={t("notNow")}
              onClick={handleDismiss}
            >
              <X aria-hidden="true" />
            </Button>
          </ItemActions>
        </Item>
      </aside>

      <Dialog
        open={showInstallInstructions}
        onOpenChange={setShowInstallInstructions}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="bg-primary/10 text-primary mb-1 flex size-10 items-center justify-center rounded-lg">
              {ios ? (
                <Share aria-hidden="true" className="size-5" />
              ) : (
                <Download aria-hidden="true" className="size-5" />
              )}
            </div>
            <DialogTitle>{t("instructionsTitle")}</DialogTitle>
            <DialogDescription>
              {t(ios ? "iosInstructions" : "browserInstructions")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setShowInstallInstructions(false)}
            >
              {t("gotIt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
