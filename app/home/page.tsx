import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

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
            <Button
              asChild
              type="submit"
              variant={"default"}
              className="basis-1/2 w-full"
            >
              <Link href="/dashboard/essentials-v2">
                Comecar!
                <ChevronRight />
              </Link>
            </Button>
          </>
        </CardContent>
      </Card>
    </main>
  );
}
