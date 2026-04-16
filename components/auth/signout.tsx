import { signOutAction } from "@/actions/authActions";
import { initialState } from "@/lib/initial-action-return";
import { useActionState } from "react";

export function SignOut() {
  const [, action] = useActionState(signOutAction, initialState);
  return (
    <form action={action}>
      <button type="submit">Logout</button>
    </form>
  );
}
