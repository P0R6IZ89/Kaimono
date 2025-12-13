import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function KoFiPlainButton({
  code = process.env.NEXT_PUBLIC_KOFI_CODE || "",
}: {
  code?: string;
}) {
  const t = useTranslations("KoFiWidget");

  return (
    <Button asChild className="gap-2">
      <Link
        href={`https://ko-fi.com/${code}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("aria-label")}
      >
        <Image
          src="/kofi-cup.png"
          alt={t("alt-text")}
          width={18}
          height={18}
          priority
        />
        <span>{t("support-button")}</span>
      </Link>
    </Button>
  );
}
