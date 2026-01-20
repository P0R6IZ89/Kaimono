"use client";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { signOutAction } from "@/actions/authActions";
import { protocol, rootDomain } from "@/util/utils";

interface DialogLogoutProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DialogLogout({ onOpenChange }: DialogLogoutProps) {
  const t = useTranslations("LogoutDialog");
  const locale = useLocale();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t("title")}</DialogTitle>
      </DialogHeader>
      <DialogFooter className="sm:justify-start">
        <Button
          onClick={async () => {
            const result = await signOutAction();
            onOpenChange?.(false);
            if (result.ok) {
              window.location.assign(
                `${protocol}://${rootDomain}/${locale}/login`,
              );
            }
          }}
        >
          {t("confirm")}
        </Button>
        <DialogClose asChild>
          <Button type="button" variant={"secondary"}>
            {t("cancel")}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

export default DialogLogout;
