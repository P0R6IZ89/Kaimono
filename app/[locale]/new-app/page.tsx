import { requireSession } from "@/actions/appActions";
import NewAppForm from "./new-app-form";

export default async function NewApp() {
  const session = await requireSession();
  return <NewAppForm session={session} />;
}
