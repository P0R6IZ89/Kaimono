import { signOutAction } from "@/actions/authActions";

export function SignOut() {
  return (
    <form action={signOutAction}>
      <button type="submit">Logout</button>
    </form>
  );
}
