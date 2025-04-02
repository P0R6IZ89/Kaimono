import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import landingImage from "@/public/shoppingv3.webp";

export default function Home() {
  return (
    <main className="flex min-h-dvh justify-center items-center">
      <Card className="w-11/12 sm:w-[450px]">
        <CardHeader>
          <CardTitle className="text-4xl font-bold tracking-tighter">
            Bem Vindo!
          </CardTitle>
          <CardDescription>
            O Aplicativo Definitivo de Controle de Compras
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <>
            <div className="flex justify-center ">
              <Image
                alt="woman doing shopping"
                src={landingImage}
                height={200}
              />
            </div>
            <Button
              asChild
              type="submit"
              variant={"default"}
              className="basis-1/2 w-full"
            >
              <Link href="/dashboard/essentials-v2">
                Dashboard
                <ChevronRight />
              </Link>
            </Button>
            <Button
              asChild
              type="submit"
              variant={"default"}
              className="basis-1/2 w-full"
            >
              <Link href="/api/auth/signin">
                Sigin
                <ChevronRight />
              </Link>
            </Button>
          </>
        </CardContent>
      </Card>
    </main>
  );
}
