"use server";

import { requireMembership, requireSession } from "./appActions";
import prisma from "@/lib/prisma";
import { projectLinkSchema, projectSchema } from "@/util/form-zod-schema";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/util/error-handler";
import { ActionResult } from "@/util/initial-action-return";

export async function createProjectAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    subdomain: formData.get("subdomain"),
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, message: first.message };
  }

  const { appId, session } = await requireMembership(parsed.data.subdomain);

  try {
    await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        appId,
        creatorId: session.user.id,
      },
    });

    revalidatePath(`/s/${parsed.data.subdomain}/projects`);
    return { ok: true, message: "Project created" };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function attachPlannedToProjectAction(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const parsed = projectLinkSchema.safeParse({
    projectId: formData.get("projectId"),
    plannedId: formData.get("plannedId"),
    subdomain: formData.get("subdomain"),
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, message: first.message };
  }

  const { appId } = await requireMembership(parsed.data.subdomain);

  const [project, planned] = await Promise.all([
    prisma.project.findFirst({
      where: { id: parsed.data.projectId, appId },
      select: { id: true },
    }),
    prisma.planned.findFirst({
      where: { id: parsed.data.plannedId, appId },
      select: { id: true },
    }),
  ]);

  if (!project) return { ok: false, message: "Project not found." };
  if (!planned) return { ok: false, message: "Planned item not found." };

  try {
    await prisma.planned.update({
      where: { id: parsed.data.plannedId },
      data: { projectId: parsed.data.projectId },
    });
    revalidatePath(`/s/${parsed.data.subdomain}/projects`);
    revalidatePath(`/s/${parsed.data.subdomain}/planned`);
    return { ok: true, message: "Planned item assigned to project" };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function unassignPlannedFromProjectAction(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const parsed = projectLinkSchema.omit({ projectId: true }).safeParse({
    plannedId: formData.get("plannedId"),
    subdomain: formData.get("subdomain"),
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, message: first.message };
  }

  const { appId } = await requireMembership(parsed.data.subdomain);

  const planned = await prisma.planned.findFirst({
    where: { id: parsed.data.plannedId, appId },
    select: { id: true },
  });

  if (!planned) return { ok: false, message: "Planned item not found." };

  try {
    await prisma.planned.update({
      where: { id: parsed.data.plannedId },
      data: { projectId: null },
    });
    revalidatePath(`/s/${parsed.data.subdomain}/projects`);
    revalidatePath(`/s/${parsed.data.subdomain}/planned`);
    return { ok: true, message: "Item removed from project" };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function getProjectsWithPlanned(subdomain: string) {
  const { appId } = await requireMembership(subdomain);

  const projects = await prisma.project.findMany({
    where: { appId },
    include: {
      plannedItems: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          price: true,
          quantity: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((project) => {
    const counts = project.plannedItems.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === "PENDING") acc.pending += 1;
        if (item.status === "PURCHASED") acc.purchased += 1;
        if (item.status === "CANCELLED") acc.cancelled += 1;
        return acc;
      },
      { total: 0, pending: 0, purchased: 0, cancelled: 0 }
    );

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      plannedItems: project.plannedItems.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        priority: item.priority,
        price: item.price ? item.price.toNumber() : 0,
        quantity: item.quantity ? item.quantity : 0,
        createdAt: item.createdAt,
      })),
      counts,
    };
  });
}

export async function getUnassignedPlanned(subdomain: string) {
  const { appId } = await requireMembership(subdomain);

  const items = await prisma.planned.findMany({
    where: { appId, projectId: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      priority: true,
      status: true,
      price: true,
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    priority: item.priority,
    status: item.status,
    price: item.price ? item.price.toNumber() : 0,
  }));
}

export async function editProjectAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    subdomain: formData.get("subdomain"),
  });

  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, message: first.message };
  }

  const { appId } = await requireMembership(parsed.data.subdomain);

  const project = await prisma.project.findFirst({
    where: { id: formData.get("id") as string, appId },
    select: { id: true },
  });

  if (!project) {
    return { ok: false, message: "Project not found." };
  }

  try {
    await prisma.project.update({
      where: { id: formData.get("id") as string },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
      },
    });

    revalidatePath(`/s/${parsed.data.subdomain}/projects`);
    return { ok: true, message: "Project updated." };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function deleteProjectAction(
  subdomain: string,
  projectId: string
) {
  const { appId } = await requireMembership(subdomain);

  const project = await prisma.project.findFirst({
    where: { id: projectId, appId },
    select: { id: true },
  });

  if (!project) {
    return { ok: false, message: "Project not found." };
  }

  try {
    await prisma.$transaction([
      prisma.planned.updateMany({
        where: { projectId: projectId },
        data: { projectId: null },
      }),
      prisma.project.delete({
        where: { id: projectId },
      }),
    ]);

    revalidatePath(`/s/${subdomain}/projects`);
    return { ok: true, message: "Project deleted." };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function countAllProjects(subdomain: string) {
  requireSession();
  const { appId } = await requireMembership(subdomain);

  const count = await prisma.project.count({
    where: { appId },
  });

  return count;
}
