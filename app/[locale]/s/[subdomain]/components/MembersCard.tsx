import MemberCount from "@/components/client/memberCounter";
import UserList from "@/components/client/userList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { protocol, rootDomain } from "@/lib/utils";
import { UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

function MembersCard({ subdomain }: { subdomain: string }) {
  const t = useTranslations("MembersCard");
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardDescription>
          <p>{t("title")}</p>
        </CardDescription>
        <CardTitle>
          <MemberCount subdomain={subdomain} />
        </CardTitle>
        <CardAction className="text-muted-foreground">
          <UserRound />
        </CardAction>
      </CardHeader>
      <CardContent>
        <UserList subdomain={subdomain} />
      </CardContent>
      <CardFooter className="gap-2">
        <Link href={`${protocol}://${subdomain}.${rootDomain}/invite`}>
          <Button variant={"outline"}>Gerenciar</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default MembersCard;
