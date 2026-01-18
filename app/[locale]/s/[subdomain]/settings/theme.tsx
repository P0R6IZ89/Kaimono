"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ChevronsUpDown, Moon, Sun, SunMoon, UserRoundCog } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

type ThemeType = {
  className?: string | undefined;
  variant?: "default" | "outline" | "muted";
};

export default function ThemeToggler({ className, variant }: ThemeType) {
  const t = useTranslations("Sidebar");

  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Item className={className} variant={variant}>
          <ItemMedia variant={"icon"} className="bg-muted rounded-lg size-8">
            <SunMoon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{t("config.theme.title")}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronsUpDown className="size-4" />
          </ItemActions>
        </Item>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-24 rounded-lg"
        side={"bottom"}
        align={"start"}
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun />
          {t("config.theme.light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon />
          {t("config.theme.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <UserRoundCog />
          {t("config.theme.system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
