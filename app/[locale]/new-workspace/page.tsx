import { requireSession } from "@/actions/appActions";
import NewWorkspaceForm from "./new-workspace-form";

export default async function NewWorkspace() {
  const session = await requireSession();
  return <NewWorkspaceForm session={session} />;
}
