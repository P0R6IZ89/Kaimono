import { requireSession } from "@/actions/appActions";
import NewTeamForm from "./new-team-form";

export default async function NewTeam() {
  const session = await requireSession();
  return <NewTeamForm session={session} />;
}
