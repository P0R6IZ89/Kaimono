import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

function Welcome() {
  return (
    <div className="flex flex-col min-h-dvh  m-auto justify-center items-center text-center px-4">
      <p className="text-9xl font-semibold leading-none tracking-tighter">✨</p>
      <p className="text-3xl pt-8 font-semibold">
        O e-mail de login foi enviado para o seu e-mail.
      </p>
      <div className="">
        <p className="pt-2">
          Abra o email enviado e clique no botão &quot;Entrar&quot; no para
          concluir seu login.
        </p>
        <p className="text-xs text-muted-foreground">
          (Verifique sua pasta de spam caso não a veja)
        </p>
        <div className="pt-8">
          <Link href={"/"}>
            <Button>Voltar à página principal</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
