import { getMyInvitationsAction } from "@/actions/membershipActions";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Notification() {
  const invitedApp = await getMyInvitationsAction();

  const t = await getTranslations("team-layout");

  return (
    <div className="flex">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"ghost"} size={"icon"} className="relative size-7">
            {invitedApp.length !== 0 ? (
              <span className="absolute top-1 right-1 inline-flex size-1 rounded-full dark:bg-sky-300 bg-sky-400" />
            ) : null}
            <Bell className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          {invitedApp.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("no-invites")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {invitedApp.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col border-b pb-2 last:border-b-0 last:pb-0"
                >
                  <p className="text-sm font-bold flex items-center gap-2">
                    <Mail className="size-4" />
                    <span>
                      {t("new-invite-to-invite-team-name", {
                        teamName: invite.app.name,
                      })}
                    </span>
                  </p>
                  <p className="text-xs pt-1">
                    {t("new-invite-content", {
                      teamName: invite.app.name,
                      inviteRole: invite.role,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground pt-2">
                    {t("check-email-for-details")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
