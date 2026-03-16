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
  const tProjects = useTranslations("Projects");
  const tPlanned = useTranslations("Planned");
  const tEssentials = useTranslations("Essentials");
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
        "https://res.cloudinary.com/dsttcre2h/image/upload/v1768714071/Plannedv2_fp2qq1.png",
    },
    {
      title: tEssentials("title"),
      description: tEssentials("description"),
      icon: ShoppingCart,
      color: "text-green-600",
      imageUrl:
        "https://res.cloudinary.com/dsttcre2h/image/upload/v1768646275/ChatGPT_Image_2026%E5%B9%B41%E6%9C%8817%E6%97%A5_19_37_36_y12qx5.png",
    },
  ];
  return (
    <Carousel className="w-full mx-auto px-2">
      <CarouselContent>
        {carouselItems.map((item, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="bg-muted/50 py-4">
                <CardContent className="flex flex-col items-center justify-center ">
                  <CldImage
                    crop={"auto"}
                    className=""
                    src={item.imageUrl}
                    width={1536 / 7}
                    height={1024 / 7}
                    alt={"Project Image"}
                  />
                  <div className="p-1 flex flex-col items-center">
                    <p className="flex gap-2 items-center ">
                      <Badge variant={"secondary"} className="text-md">
                        {item.icon && (
                          <item.icon className={` ${item.color}`} />
                        )}
                        {item.title}
                      </Badge>
                    </p>
                    <span className="pt-2 text-sm text-center text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        variant={"ghost"}
        className="absolute left-3 z-10 flex items-center justify-center w-10 h-10 cursor-pointer"
      />
      <CarouselNext
        variant={"ghost"}
        className="absolute right-3 z-10 flex items-center justify-center w-10 h-10 cursor-pointer"
      />
    </Carousel>
  );
}
