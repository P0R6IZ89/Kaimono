import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 min-h-dvh max-w-lg m-auto justify-center items-center pl-8 pr-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tighter text-center">
          Apresentando o App Ultimate To Buy
        </h1>
        <p className="text-muted-foreground text-center">
          Adicione a este aplicativo tudo o que você tem em mente, analise e
          tome a melhor decisão!
        </p>
        <div className="pt-5 pb-5 flex flex-row gap-2 justify-center items-center">
          <Avatar>
            <AvatarImage className="" src="" />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          <span className="inline-flex text-xs">
            <p className="text-muted-foreground">Created by&nbsp;</p>
            <p>Alam Sawame</p>
          </span>
        </div>
      </div>
      <Button asChild type="submit" variant={"default"} className="w-full">
        <Link href="/">
          Comecar!
          <ChevronRight />
        </Link>
      </Button>
    </div>
  );
}
