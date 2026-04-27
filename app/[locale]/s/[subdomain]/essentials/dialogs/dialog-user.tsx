import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { useTranslations } from "next-intl";

function UserDialog() {
  const t = useTranslations("UserDialog");
  const tCommon = useTranslations("Common");
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription>
          {t("description")}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <Avatar></Avatar>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">{tCommon("actions.cancel")}</Button>
        </DialogClose>
        <Button type="submit">{t("submit")}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default UserDialog;
