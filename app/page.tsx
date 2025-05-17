import { redirect } from "next/navigation";

function getSubdomain() {
  return true;
}

export default async function App() {
  const subdomain = await getSubdomain();
  if (!subdomain) {
    redirect("/new-app");
  }
  return (
    <main className="flex flex-col gap-4 min-h-dvh max-w-lg m-auto justify-center items-center pl-8 pr-8">
      <div>
        Aqui vai a list de subdominios do usuario, se nao existir redireciona
        para new app
      </div>
    </main>
  );
}
