"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { protocol, rootDomain } from "@/lib/utils";
import { getErrorMessage } from "@/util/error-handler";
import { appSchema } from "@/util/form-zod-schema";
import { Prisma } from "@prisma/client";
import { AuthError, Session } from "next-auth";
import { redirect } from "next/navigation";

export const getAllAppsAction = async () => {
  const session = await auth();
  let apps;
  if (!session?.user) redirect("/login");
  try {
    apps = await prisma.app.findMany({
      where: {
        user: {
          some: {
            id: session.user.id,
          },
        },
      },
    });
  } catch (error: unknown) {
    console.error("[getAllAppsAction] unexpected error:", error);
    throw new Error(getErrorMessage(error));
  }
  return apps;
};

export async function getUserAppsAction() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    const apps = await prisma.app.findMany({
      where: { user: { some: { id: session.user.id } } },
      include: {
        _count: {
          select: {
            user: true,
          },
        },
      },
    });
    return apps;
  } catch (error: unknown) {
    console.error("[getUserAppsAction] unexpected error:", error);
    throw new Error("Unable to retrieve your apps. Please try again later.");
  }
}

export const getAppFromSubdomainAction = async (
  subdomain: string
): Promise<{
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  subdomain: string | null;
}> => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    const app = await prisma.app.findFirst({
      where: {
        subdomain,
        user: {
          some: {
            id: session.user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        subdomain: true,
        image: true,
      },
    });
    if (!app) {
      console.error(
        `[getAppFromSubdomainAction] no app found for subdomain="${subdomain}" and userId="${session.user.id}"`
      );
      throw new Error(
        `No app found with subdomain \"${subdomain}\" for the current user.`
      );
    }
    return app;
  } catch (error: unknown) {
    console.error("[getAppFromSubdomainAction] unexpected error:", error);
    throw new Error(getErrorMessage(error));
  }
};

export async function createAppAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name")?.toString() as string;
  const description = formData.get("description")?.toString() as string;
  const rawSubdomain = formData.get("subdomain")?.toString() as string;

  const result = appSchema.safeParse({
    name,
    subdomain: rawSubdomain.toLowerCase(),
    description,
  });
  if (!result.success) {
    console.log(result.error);
    return { error: result.error.errors[0].message };
  }
  const { subdomain } = result.data;

  const session = await auth();
  if (!session?.user)
    throw new AuthError("Unauthorized. User session not found.");

  try {
    await prisma.app.create({
      data: {
        name,
        description,
        subdomain,
        user: {
          connect: { id: session.user.id },
        },
      },
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "Este subdomínio já existe." };
      }
      if (error.code === "P2012") {
        return { error: "Campo obrigatório ausente" };
      }
      return { error: "Algo deu errado" };
    }
    console.error("[createAppAction] unexpected error:", error);
    return { error: getErrorMessage(error) };
  }
  redirect(`${protocol}://${subdomain}.${rootDomain}`);
}

export async function isUserBelongsTheApp(
  subdomain: string,
  session: Session | null
): Promise<{ id: string }> {
  if (!session?.user) {
    redirect("/login");
  }
  try {
    const app = await prisma.app.findUnique({
      where: {
        subdomain,
        user: {
          some: {
            id: session.user.id,
          },
        },
      },
      select: { id: true },
    });
    if (!app) {
      throw new Error(
        `Cannot find any app with subdomain="${subdomain}" for this user.`
      );
    }
    return { id: app.id };
  } catch (error: unknown) {
    console.error("[isUserBelongsTheApp] unexpected error:", error);
    throw error;
  }
}
