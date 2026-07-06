import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { getCurrentLocale, redirect } from "@/i18n/navigation";
import { revalidatePath } from "next/cache";

import { createAppAction } from "@/actions/appActions";
import { mockSession } from "./helpers/auth";
import { cleanDatabase, createTestUser, testPrisma } from "./helpers/db";
import { createFormData } from "./helpers/form-data";

describe("workspace creation", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await cleanDatabase();

    vi.mocked(getCurrentLocale).mockResolvedValue("en" as never);
    vi.mocked(redirect).mockImplementation((target) => {
      throw Object.assign(new Error("NEXT_REDIRECT"), { target });
    });
  });

  it("create workspace and owner membership for signed-in user", async () => {
    const user = await createTestUser();
    mockSession(user);

    const formData = createFormData({
      name: "My Workspace",
      description: "Shared shopping list",
      subdomain: "my-workspace",
    });

    await expect(createAppAction(null, formData)).rejects.toThrow(
      "NEXT_REDIRECT",
    );

    const app = await testPrisma.app.findUnique({
      where: { subdomain: "my-workspace" },
      include: { memberships: true },
    });

    expect(app).not.toBeNull();
    expect(app).toMatchObject({
      name: "My Workspace",
      description: "Shared shopping list",
      subdomain: "my-workspace",
    });

    expect(app?.memberships).toHaveLength(1);
    expect(app?.memberships[0]).toMatchObject({
      userId: user.id,
      role: "OWNER",
    });

    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(redirect).toHaveBeenCalled();
  });

  it("reject reserved subdomain without creating workspace", async () => {
    const user = await createTestUser();
    mockSession(user);

    const result = await createAppAction(
      null,
      createFormData({
        name: "Reserved Workspace",
        description: "",
        subdomain: "www",
      }),
    );
    expect(result).toMatchObject({
      ok: false,
      message: "subdomain-reserved",
    });
    await expect(testPrisma.app.count()).resolves.toBe(0);
    await expect(testPrisma.membership.count()).resolves.toBe(0);
  });

  it("rejects duplicate subdomain without creating another membership", async () => {
    const existingOwner = await createTestUser();
    const user = await createTestUser();
    mockSession(user);

    const existingApp = await testPrisma.app.create({
      data: {
        name: "Existing Workspace",
        subdomain: "taken",
        memberships: {
          create: {
            userId: existingOwner.id,
            role: "OWNER",
          },
        },
      },
    });

    const result = await createAppAction(
      null,
      createFormData({
        name: "Duplicate Workspace",
        description: "",
        subdomain: "taken",
      }),
    );

    expect(result).toMatchObject({
      ok: false,
      code: "SUBDOMAIN_TAKEN",
    });

    await expect(testPrisma.app.count()).resolves.toBe(1);
    await expect(
      testPrisma.membership.count({ where: { appId: existingApp.id } }),
    ).resolves.toBe(1);
  });

  it("rejects invalid form without creating workspace", async () => {
    const user = await createTestUser();
    mockSession(user);

    const result = await createAppAction(
      null,
      createFormData({
        name: "",
        description: "",
        subdomain: "valid-workspace",
      }),
    );

    expect(result).toMatchObject({
      ok: false,
      message: "workspace-name-required",
    });

    await expect(testPrisma.app.count()).resolves.toBe(0);
    await expect(testPrisma.membership.count()).resolves.toBe(0);
  });
});
