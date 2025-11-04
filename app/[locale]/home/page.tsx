import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Homepage");
  return (
    <div className="flex flex-col gap-4 min-h-dvh max-w-lg m-auto justify-center items-center pl-8 pr-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tighter text-center">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-center">{t("description")}</p>
        <div className="pt-5 pb-5 flex flex-row gap-2 justify-center items-center">
          <Avatar>
            <AvatarImage className="" src="" />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          <span className="inline-flex text-xs">
            <p className="text-muted-foreground">
              {t("created-by", { creatorName: "Alam Sawame" })}
            </p>
          </span>
        </div>
      </div>
      <Button asChild type="submit" variant={"default"} className="w-full">
        <Link href="/">
          {t("get-started-button")}
          <ChevronRight />
        </Link>
      </Button>
    </div>
  );
}
