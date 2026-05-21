import { cn } from "@/lib/utils";
import { HomeTopBarImage } from "./HomeTopBarImage";
import { PlusCircle } from "lucide-react";
import { ProjectCreateDialog } from "../projects/components/project-create-dialog";

type HomeTopBarItem = {
  id: string;
  name?: string | null | undefined;
  image?: string | null;
  icon?: string | null;
  type?: string | undefined;
}[];

export function HomeTopBar({
  projects,
  activeProjectId,
  setActiveProjectId,
}: {
  projects: HomeTopBarItem;
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
}) {
  return (
    <div className="flex min-w-0 max-w-full flex-row gap-2 overflow-x-auto">
      {projects.map((project) => (
        <button
          key={project.id}
          type="button"
          aria-pressed={activeProjectId === project.id}
          onClick={() => setActiveProjectId(project.id)}
          className="group flex max-w-20 flex-col items-center gap-2 rounded-lg focus-visible:outline-none overflow-clip"
        >
          <HomeTopBarImage
            projectType={project.type}
            imageSrc={project.image}
            alt={project.name || "Project Image"}
            selected={activeProjectId === project.id}
          />

          <p
            className={cn(
              "w-full truncate text-center text-sm text-muted-foreground transition-colors group-hover:text-foreground",
              activeProjectId === project.id && "font-medium text-foreground",
            )}
          >
            {project.name}
          </p>
        </button>
      ))}
      <ProjectCreateDialog
        buttonVariant="ghost"
        className="size-20 border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <PlusCircle className="size-5" />
      </ProjectCreateDialog>
    </div>
  );
}
