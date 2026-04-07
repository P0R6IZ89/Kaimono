import { Separator } from "@/components/ui/separator";
import { allProjectType } from "./HomeContent";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

export function FilteredHomeContent({
  activeProjectId,
  allProjects,
}: {
  activeProjectId: string | null;
  allProjects: allProjectType;
}) {
  const activeProject = allProjects.find(
    (project) => project.id === activeProjectId,
  );
  if (!activeProject) {
    return <p>No project selected.</p>;
  }

  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 350: 2, 750: 2, 900: 3 }}
      gutterBreakPoints={{ 350: "12px", 750: "16px", 900: "24px" }}
    >
      <Masonry columnsCount={3} gutter="1rem">
        {activeProject.plannedItems.map((item) => (
          <Card
            key={item.id}
            className="mb-4 gap-0 w-full break-inside-avoid overflow-hidden rounded-xl p-0 shadow"
          >
            <div className="relative">
              {item.image && (
                <Image
                  width={600}
                  height={600}
                  src={item.image}
                  alt={item.title}
                  className="h-auto w-full object-cover"
                />
              )}
              <Button
                asChild
                variant={"secondary"}
                className="absolute rounded-full bottom-2 right-2"
              >
                <a
                  href={`${item.productUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkIcon />
                </a>
              </Button>
            </div>
            <CardHeader className="p-2">
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
}
