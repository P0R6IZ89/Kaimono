import { cn } from "@/lib/utils";
import { HomeTopBarImage } from "./HomeTopBarImage";

type HomeTopBarItem = {
  id: string;
  name: string;
  image: string | null;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | null;
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
    <div className="flex flex-row gap-2 overflow-x-auto">
      {projects.map((project) => (
        <button
          key={project.id}
          type="button"
          aria-pressed={activeProjectId === project.id}
          onClick={() => setActiveProjectId(project.id)}
          className="group flex max-w-20 flex-col items-center gap-2 rounded-lg focus-visible:outline-none"
        >
          {project.icon ? (
            <div
              className={cn(
                "flex size-20 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground transition-all group-hover:bg-muted group-hover:text-foreground group-focus-visible:border-ring group-focus-visible:ring-ring/50 group-focus-visible:ring-[3px]",
                activeProjectId === project.id &&
                  "border-primary/50 bg-card text-foreground shadow-sm ring-2 ring-primary/20",
              )}
            >
              <project.icon className="size-6" />
            </div>
          ) : (
            <HomeTopBarImage
              imageSrc={project.image}
              alt={project.name}
              selected={activeProjectId === project.id}
            />
          )}
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
    </div>
  );
}
