import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  getCurrentLocale: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { acceptInviteAction } from "@/actions/invitationActions";
import { mockSession } from "./helpers/auth";
import { cleanDatabase, createTestUser, testPrisma } from "./helpers/db";

describe("invitation acceptance", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await cleanDatabase();
  });

  it("create membershipp and marks invitation accepted", async () => {
    const owner = await createTestUser({
      email: "owner@examlpe.com",
      name: "Owner",
    });
    const invitedUser = await createTestUser({
      email: "invited@example.com",
      name: "Invited User",
    });
    const app = await testPrisma.app.create({
      data: {
        name: "Shared Workspace",
        description: "",
        subdomain: "shared-workspace",
        memberships: {
          create: {
            userId: owner.id,
            role: "OWNER",
          },
        },
      },
    });

    const invitation = await testPrisma.invitation.create({
      data: {
        appId: app.id,
        email: invitedUser.email,
        token: `invite-${crypto.randomUUID()}`,
        role: "MEMBER",
        inviterId: owner.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    mockSession(invitedUser);

    const result = await acceptInviteAction(invitation.token);
    expect(result).toMatchObject({
      success: true,
      appId: app.id,
    });

    const membership = await testPrisma.membership.findUnique({
      where: {
        appId_userId: {
          appId: app.id,
          userId: invitedUser.id,
        },
      },
    });
    expect(membership).toMatchObject({
      appId: app.id,
      userId: invitedUser.id,
      role: "MEMBER",
    });

    const updatedInvite = await testPrisma.invitation.findUnique({
      where: { id: invitation.id },
    });
    expect(updatedInvite).toMatchObject({
      status: "ACCEPTED",
    });
    expect(updatedInvite?.acceptedAt).toBeInstanceOf(Date);
  });

  it("rejects when signed-in user email does not match invitation email", async () => {
    const owner = await createTestUser({ email: "owner@example.com" });
    const wrongUser = await createTestUser({ email: "wrong@example.com" });

    const app = await testPrisma.app.create({
      data: {
        name: "Shared Workspace",
        subdomain: "shared-workspace",
        memberships: {
          create: {
            userId: owner.id,
            role: "OWNER",
          },
        },
      },
    });

    const invitation = await testPrisma.invitation.create({
      data: {
        appId: app.id,
        email: "invited@example.com",
        inviterId: owner.id,
        token: `invite-${crypto.randomUUID()}`,
        role: "MEMBER",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    mockSession(wrongUser);

    const result = await acceptInviteAction(invitation.token);

    expect(result).toEqual({
      error: "inviteWrongEmail",
    });

    await expect(testPrisma.membership.count()).resolves.toBe(1);
  });

  it("rejects expired invitation without creating membership", async () => {
    const owner = await createTestUser({ email: "owner@example.com" });
    const invitedUser = await createTestUser({ email: "invited@example.com" });

    const app = await testPrisma.app.create({
      data: {
        name: "Shared Workspace",
        subdomain: "shared-workspace",
        memberships: {
          create: {
            userId: owner.id,
            role: "OWNER",
          },
        },
      },
    });

    const invitation = await testPrisma.invitation.create({
      data: {
        appId: app.id,
        email: invitedUser.email,
        inviterId: owner.id,
        token: `invite-${crypto.randomUUID()}`,
        role: "MEMBER",
        expiresAt: new Date(Date.now() - 60 * 1000),
      },
    });

    mockSession(invitedUser);

    const result = await acceptInviteAction(invitation.token);

    expect(result).toEqual({
      error: "inviteInvalidOrExpired",
    });

    await expect(testPrisma.membership.count()).resolves.toBe(1);

    const updatedInvite = await testPrisma.invitation.findUnique({
      where: { id: invitation.id },
    });

    expect(updatedInvite?.status).toBe("PENDING");
    expect(updatedInvite?.acceptedAt).toBeNull();
  });
});
