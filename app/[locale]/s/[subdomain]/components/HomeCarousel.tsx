"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Layers, ShoppingCart, Sofa } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { useTranslations } from "next-intl";

export default function HomeCarousel({}) {
  const tProjects = useTranslations("ProjectsPage");
  const tPlanned = useTranslations("PlannedPage");
  const tEssentials = useTranslations("EssentialsPage");
  const carouselItems = [
    {
      title: tProjects("title"),
      description: tProjects("description"),
      icon: Layers,
      color: "text-amber-600",
      imageUrl:
        "https://res.cloudinary.com/dsttcre2h/image/upload/v1768552844/ProjectImage_neuiq1.png",
    },
    {
      title: tPlanned("title"),
      description: tPlanned("description"),
      icon: Sofa,
      color: "text-blue-600",
      imageUrl:
        "https://res.cloudinary.com/dsttcre2h/image/upload/v1768544258/387e5a9476026814f93d7910d50a15d04db8b56bd8baa4cf04fd302dc90f29fc_mxfuhs.jpg",
    },
    {
      title: tEssentials("title"),
      description: tEssentials("description"),
      icon: ShoppingCart,
      color: "text-green-600",
      imageUrl:
        "https://res.cloudinary.com/dsttcre2h/image/upload/v1768544258/387e5a9476026814f93d7910d50a15d04db8b56bd8baa4cf04fd302dc90f29fc_mxfuhs.jpg",
    },
  ];
  return (
    <Carousel className="w-[calc(100%-20%)] mx-auto">
      <CarouselContent>
        {carouselItems.map((item, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="bg-background">
                <CardContent className="flex flex-col p-0 items-center justify-center ">
                  <CldImage
                    className=""
                    src={item.imageUrl}
                    width={1536 / 3}
                    height={1024 / 3}
                    crop={"crop"}
                    alt={"Project Image"}
                  />
                  <p className="flex gap-2 pt-4 items-center ">
                    <Badge variant={"secondary"} className="text-md">
                      {item.icon && <item.icon className={` ${item.color}`} />}
                      {item.title}
                    </Badge>
                  </p>
                  <span className="pt-2 text-sm text-center text-muted-foreground">
                    {tProjects("description")}
                  </span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
