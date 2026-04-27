import { signOutAction } from "@/actions/authActions";
import { initialState } from "@/lib/initial-action-return";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

export function SignOut() {
  const [, action] = useActionState(signOutAction, initialState);
  const t = useTranslations("Common");
  return (
    <form action={action}>
      <button type="submit">{t("actions.signOut")}</button>
    </form>
  );
}
