"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createProjectAction } from "@/actions/projectActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Props = { subdomain: string };

const initialState = { ok: false, message: "" };

export function ProjectCreateCard({ subdomain }: Props) {
  const t = useTranslations("ProjectsPage");
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createProjectAction,
    initialState
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(t("toast-created"));
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [router, state, t]);

  return (
    <Card className=" border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background shadow-none">
      <CardHeader className="flex flex-row justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("create.title")}
          </CardTitle>
          <CardDescription>{t("create.description")}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">{t("form.name")}</Label>
            <Input
              id="project-name"
              name="name"
              placeholder={t("form.name-placeholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">{t("form.description")}</Label>
            <Textarea
              id="project-description"
              name="description"
              placeholder={t("form.description-placeholder")}
              className="min-h-24 resize-none"
            />
          </div>

          {state?.message && !state.ok ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <input type="hidden" name="subdomain" value={subdomain} />

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("form.create")}
            </Button>
            <Button type="reset" variant="outline">
              {t("form.reset")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
