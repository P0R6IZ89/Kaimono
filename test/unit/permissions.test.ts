import { describe, expect, it } from "vitest";

import {
  canDeleteComment,
  canManageInvites,
  canRemoveMember,
  type AppRole,
} from "@/lib/permissions";

describe("canManageInvites", () => {
  it.each([
    { role: "OWNER", expected: true },
    { role: "ADMIN", expected: true },
    { role: "MEMBER", expected: false },
  ] satisfies Array<{ role: AppRole; expected: boolean }>)(
    "returns $expected for role $role",
    ({ role, expected }) => {
      expect(canManageInvites(role)).toBe(expected);
    },
  );
});

describe("canDeleteComment", () => {
  const currentUserId = "current-user";
  const otherUserId = "other-user";

  it.each([
    { role: "OWNER", authorId: currentUserId, expected: true },
    { role: "OWNER", authorId: otherUserId, expected: true },
    { role: "ADMIN", authorId: currentUserId, expected: true },
    { role: "ADMIN", authorId: otherUserId, expected: true },
    { role: "MEMBER", authorId: currentUserId, expected: true },
    { role: "MEMBER", authorId: otherUserId, expected: false },
  ] satisfies Array<{
    role: AppRole;
    authorId: string;
    expected: boolean;
  }>)(
    "returns $expected for $role deleting comment by $authorId",
    ({ role, authorId, expected }) => {
      expect(
        canDeleteComment({
          role,
          currentUserId,
          authorId,
        }),
      ).toBe(expected);
    },
  );
});

describe("canRemoveMember", () => {
  it.each([
    { actingRole: "OWNER", targetRole: "OWNER", expected: true },
    { actingRole: "OWNER", targetRole: "ADMIN", expected: true },
    { actingRole: "OWNER", targetRole: "MEMBER", expected: true },
    { actingRole: "ADMIN", targetRole: "OWNER", expected: false },
    { actingRole: "ADMIN", targetRole: "ADMIN", expected: false },
    { actingRole: "ADMIN", targetRole: "MEMBER", expected: true },
    { actingRole: "MEMBER", targetRole: "OWNER", expected: false },
    { actingRole: "MEMBER", targetRole: "ADMIN", expected: false },
    { actingRole: "MEMBER", targetRole: "MEMBER", expected: false },
  ] satisfies Array<{
    actingRole: AppRole;
    targetRole: AppRole;
    expected: boolean;
  }>)(
    "returns $expected when $actingRole removes another $targetRole",
    ({ actingRole, targetRole, expected }) => {
      expect(
        canRemoveMember({
          actingRole,
          targetRole,
          removingSelf: false,
        }),
      ).toBe(expected);
    },
  );

  it.each([
    { actingRole: "OWNER", targetRole: "OWNER" },
    { actingRole: "OWNER", targetRole: "ADMIN" },
    { actingRole: "OWNER", targetRole: "MEMBER" },
    { actingRole: "ADMIN", targetRole: "OWNER" },
    { actingRole: "ADMIN", targetRole: "ADMIN" },
    { actingRole: "ADMIN", targetRole: "MEMBER" },
    { actingRole: "MEMBER", targetRole: "OWNER" },
    { actingRole: "MEMBER", targetRole: "ADMIN" },
    { actingRole: "MEMBER", targetRole: "MEMBER" },
  ] satisfies Array<{
    actingRole: AppRole;
    targetRole: AppRole;
  }>)(
    "allows $actingRole to remove themselves from a $targetRole membership",
    ({ actingRole, targetRole }) => {
      expect(
        canRemoveMember({
          actingRole,
          targetRole,
          removingSelf: true,
        }),
      ).toBe(true);
    },
  );
});
