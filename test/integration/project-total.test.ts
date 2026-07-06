import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { getProjectBudgetSummary } from "@/lib/project-budget";
import { cleanDatabase, createTestUser, testPrisma } from "./helpers/db";

describe("project total calculation", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it("calculates project total from active planned items", async () => {
    const user = await createTestUser();
    const app = await testPrisma.app.create({
      data: {
        name: "Shopping Workspace",
        subdomain: "shopping-workspace",
        memberships: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });
    const project = await testPrisma.project.create({
      data: {
        name: "Desk Setup",
        budget: 500,
        appId: app.id,
        creatorId: user.id,
      },
    });

    await testPrisma.planned.createMany({
      data: [
        {
          title: "Keyboard",
          price: 129.99,
          quantity: 2,
          priority: "HIGH",
          status: "PENDING",
          image: "https://example.com/keyboard.jpg",
          appId: app.id,
          creatorId: user.id,
          projectId: project.id,
          projectAppId: project.appId,
        },
        {
          title: "Mouse",
          price: 80,
          quantity: 1,
          priority: "MEDIUM",
          status: "PURCHASED",
          image: "https://example.com/mouse.jpg",
          appId: app.id,
          creatorId: user.id,
          projectId: project.id,
          projectAppId: project.appId,
        },
        {
          title: "Cancelled Monitor",
          price: 300,
          quantity: 1,
          priority: "LOW",
          status: "CANCELLED",
          image: "https://example.com/monitor.jpg",
          appId: app.id,
          creatorId: user.id,
          projectId: project.id,
          projectAppId: project.appId,
        },
        {
          title: "Unassigned Chair",
          price: 200,
          quantity: 1,
          priority: "LOW",
          status: "PENDING",
          image: "https://example.com/chair.jpg",
          appId: app.id,
          creatorId: user.id,
        },
      ],
    });

    const projectWithItems = await testPrisma.project.findUniqueOrThrow({
      where: { id: project.id },
      include: {
        plannedItems: {
          select: {
            price: true,
            quantity: true,
            status: true,
          },
        },
      },
    });

    const summary = getProjectBudgetSummary(
      projectWithItems.budget?.toNumber() ?? null,
      projectWithItems.plannedItems.map((item) => ({
        price: item.price.toNumber(),
        quantity: item.quantity,
        status: item.status,
      })),
    );

    expect(projectWithItems.plannedItems).toHaveLength(3);
    expect(summary).toEqual({
      activeTotal: 339.98,
      budget: 500,
      remaining: 160.02,
      overage: 0,
      percentage: 67.996,
      state: "within",
    });
  });

  it("reports over budget when active project items exceed budget", async () => {
    const user = await createTestUser();
    const app = await testPrisma.app.create({
      data: {
        name: "Shopping Workspace",
        subdomain: "shopping-workspace",
        memberships: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });
    const project = await testPrisma.project.create({
      data: {
        name: "Small Upgrade",
        budget: 100,
        appId: app.id,
        creatorId: user.id,
      },
    });

    await testPrisma.planned.create({
      data: {
        title: "Keyboard",
        price: 129.99,
        quantity: 1,
        priority: "HIGH",
        status: "PENDING",
        image: "https://example.com/keyboard.jpg",
        appId: app.id,
        creatorId: user.id,
        projectId: project.id,
        projectAppId: project.appId,
      },
    });

    const projectWithItems = await testPrisma.project.findUniqueOrThrow({
      where: { id: project.id },
      include: {
        plannedItems: {
          select: {
            price: true,
            quantity: true,
            status: true,
          },
        },
      },
    });

    const summary = getProjectBudgetSummary(
      projectWithItems.budget?.toNumber() ?? null,
      projectWithItems.plannedItems.map((item) => ({
        price: item.price.toNumber(),
        quantity: item.quantity,
        status: item.status,
      })),
    );

    expect(summary).toEqual({
      activeTotal: 129.99,
      budget: 100,
      remaining: 0,
      overage: 29.99,
      percentage: 129.99,
      state: "over",
    });
  });
});
