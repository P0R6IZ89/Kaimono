"use server";

import { requireMembership, requireSession } from "./appActions";
import type { ProjectWithFirstPlannedImage } from "@/app/[locale]/types/projects";
import prisma from "@/lib/prisma";
import {
  projectLinkSchema,
  projectPlannedCreateSchema,
  projectSchema,
} from "@/lib/form-zod-schema";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/error-handler";
import { ActionResult } from "@/lib/initial-action-return";

const PLANNED_PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/dsttcre2h/image/upload/v1751870559/placeholder_dtzhrr.png";

export async function createProjectAction(
  _prevState: ActionResult,
  formData: FormData,
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
    return { ok: true, message: "projectCreated" };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function attachPlannedToProjectAction(
  _prevState: unknown,
  formData: FormData,
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
      select: { id: true, appId: true },
    }),
    prisma.planned.findFirst({
      where: { id: parsed.data.plannedId, appId },
      select: { id: true },
    }),
  ]);

  if (!project) return { ok: false, message: "projectNotFound" };
  if (!planned) return { ok: false, message: "plannedNotFound" };

  try {
    await prisma.planned.update({
      where: { id: parsed.data.plannedId },
      data: {
        projectId: parsed.data.projectId,
        projectAppId: project.appId,
      },
    });
    revalidatePath(`/s/${parsed.data.subdomain}/projects`);
    revalidatePath(`/s/${parsed.data.subdomain}/planned`);
    return { ok: true, message: "plannedAssignedToProject" };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function unassignPlannedFromProjectAction(
  _prevState: unknown,
  formData: FormData,
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

  if (!planned) return { ok: false, message: "plannedNotFound" };

  try {
    await prisma.planned.update({
      where: { id: parsed.data.plannedId },
      data: { projectId: null, projectAppId: null },
    });
    revalidatePath(`/s/${parsed.data.subdomain}/projects`);
    revalidatePath(`/s/${parsed.data.subdomain}/planned`);
    return { ok: true, message: "plannedRemovedFromProject" };
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
          image: true,
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
      { total: 0, pending: 0, purchased: 0, cancelled: 0 },
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
        image: item.image,
      })),
      counts,
    };
  });
}
export async function getAllProjectsAndPlanned(subdomain: string) {
  const { appId } = await requireMembership(subdomain);

  const projects = await prisma.project.findMany({
    where: { appId },
    include: {
      plannedItems: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          productUrl: true,
          status: true,
          priority: true,
          price: true,
          quantity: true,
          createdAt: true,
          image: true,
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
      { total: 0, pending: 0, purchased: 0, cancelled: 0 },
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
        productUrl: item.productUrl,
        status: item.status,
        priority: item.priority,
        price: item.price ? item.price.toNumber() : 0,
        quantity: item.quantity ? item.quantity : 0,
        createdAt: item.createdAt,
        image: item.image,
      })),
      counts,
    };
  });
}

export async function getProjectWithFirstPlanned(
  subdomain: string,
): Promise<ProjectWithFirstPlannedImage[]> {
  const { appId } = await requireMembership(subdomain);

  const projects = await prisma.project.findMany({
    where: { appId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      plannedItems: {
        orderBy: { createdAt: "desc" },
        where: {
          image: {
            notIn: ["", PLANNED_PLACEHOLDER_IMAGE],
          },
        },
        take: 1,
        select: {
          image: true,
          title: true,
        },
      },
    },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    image: project.plannedItems[0]?.image ?? null,
  }));
}

export async function getUnassignedPlanned(subdomain: string) {
  const { appId } = await requireMembership(subdomain);

  const items = await prisma.planned.findMany({
    where: { appId, projectId: null },
    orderBy: { createdAt: "desc" },
    // take: 50,
    select: {
      id: true,
      title: true,
      priority: true,
      status: true,
      price: true,
      quantity: true,
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    priority: item.priority,
    status: item.status,
    price: item.price ? item.price.toNumber() : 0,
    quantity: item.quantity ? item.quantity : 1,
  }));
}

export async function editProjectAction(
  _prevState: ActionResult,
  formData: FormData,
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
    return { ok: false, message: "projectNotFound" };
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
    return { ok: true, message: "projectUpdated" };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function deleteProjectAction(
  subdomain: string,
  projectId: string,
) {
  const { appId } = await requireMembership(subdomain);

  const project = await prisma.project.findFirst({
    where: { id: projectId, appId },
    select: { id: true },
  });

  if (!project) {
    return { ok: false, message: "projectNotFound" };
  }

  try {
    await prisma.$transaction([
      prisma.planned.updateMany({
        where: { projectId: projectId },
        data: { projectId: null, projectAppId: null },
      }),
      prisma.project.delete({
        where: { id: projectId },
      }),
    ]);

    revalidatePath(`/s/${subdomain}/projects`);
    return { ok: true, message: "projectDeleted" };
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

export async function createPlannedInProjectAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = projectPlannedCreateSchema.safeParse({
    projectId: formData.get("projectId"),
    subdomain: formData.get("subdomain"),
    title: formData.get("title"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    priority: formData.get("priority"),
    image: formData.get("image"),
    productUrl: formData.get("productUrl"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    console.log(parsed.error);
    const first = parsed.error.errors[0];
    return { ok: false, message: first.message };
  }

  const {
    projectId,
    subdomain,
    title,
    price,
    quantity,
    priority,
    image,
    productUrl,
    description,
  } = parsed.data;
  const { appId, session } = await requireMembership(subdomain);

  const project = await prisma.project.findFirst({
    where: { id: projectId, appId },
    select: { id: true, appId: true },
  });

  if (!project) {
    return { ok: false, message: "projectNotFound" };
  }

  try {
    await prisma.planned.create({
      data: {
        title,
        price,
        quantity,
        priority,
        status: "PENDING",
        image,
        productUrl,
        description,
        appId,
        creatorId: session.user.id,
        projectId,
        projectAppId: project.appId,
      },
    });

    revalidatePath(`/s/${subdomain}/projects`);
    revalidatePath(`/s/${subdomain}/planned`);
    revalidatePath(`/s/${subdomain}`);
    return { ok: true, message: "plannedCreated" };
  } catch (error: unknown) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
