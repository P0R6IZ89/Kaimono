import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  getCurrentLocale: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { getCurrentLocale } from "@/i18n/navigation";
import { revalidatePath } from "next/cache";

import { createPlannedAction } from "@/actions/plannedActions";
import { mockSession } from "./helpers/auth";
import { cleanDatabase, createTestUser, testPrisma } from "./helpers/db";
import { createFormData } from "./helpers/form-data";

const validPlannedForm = {
  title: "Mechanical Keyboard",
  price: "129.99",
  quantity: "2",
  priority: "HIGH",
  status: "PENDING",
  productUrl: "https://example.com/keyboard",
  description: "Compare switches before buying.",
  subdomain: "shopping-workspace",
  image: "https://example.com/keyboard.jpg",
};

describe("planned item creation", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await cleanDatabase();

    vi.mocked(getCurrentLocale).mockResolvedValue("en" as never);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it("creates planned item for workspace member", async () => {
    const user = await createTestUser();
    mockSession(user);

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

    const result = await createPlannedAction(
      { ok: false },
      createFormData(validPlannedForm),
    );

    expect(result).toEqual({
      ok: true,
      message: "plannedCreated",
    });

    const planned = await testPrisma.planned.findFirst({
      where: {
        appId: app.id,
        creatorId: user.id,
        title: "Mechanical Keyboard",
      },
    });

    expect(planned).toMatchObject({
      title: "Mechanical Keyboard",
      priority: "HIGH",
      status: "PENDING",
      quantity: 2,
      appId: app.id,
      creatorId: user.id,
      productUrl: "https://example.com/keyboard",
      description: "Compare switches before buying.",
      image: "https://example.com/keyboard.jpg",
    });
    expect(planned?.price.toNumber()).toBe(129.99);

    expect(revalidatePath).toHaveBeenCalledWith(
      "/s/shopping-workspace/planned",
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/s/shopping-workspace/projects",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/s/shopping-workspace");
  });

  it("rejects invalid planned item without creating row", async () => {
    const user = await createTestUser();
    mockSession(user);

    await testPrisma.app.create({
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

    const result = await createPlannedAction(
      { ok: false },
      createFormData({
        ...validPlannedForm,
        title: "",
      }),
    );

    expect(result).toMatchObject({
      ok: false,
      message: "productNameRequired",
    });

    await expect(testPrisma.planned.count()).resolves.toBe(0);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("throws when signed-in user is not a workspace member", async () => {
    const owner = await createTestUser({ email: "owner@example.com" });
    const outsider = await createTestUser({ email: "outsider@example.com" });
    mockSession(outsider);

    await testPrisma.app.create({
      data: {
        name: "Shopping Workspace",
        subdomain: "shopping-workspace",
        memberships: {
          create: {
            userId: owner.id,
            role: "OWNER",
          },
        },
      },
    });

    await expect(
      createPlannedAction({ ok: false }, createFormData(validPlannedForm)),
    ).rejects.toThrow("Error: Not a member of the app");

    await expect(testPrisma.planned.count()).resolves.toBe(0);
  });
});
