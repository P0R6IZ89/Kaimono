export type AppRole = "OWNER" | "ADMIN" | "MEMBER";

export function canManageInvites(role: AppRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canDeleteComment(input: {
  role: AppRole;
  currentUserId: string;
  authorId: string;
}): boolean {
  const isAuthor = input.currentUserId === input.authorId;
  const isManager = input.role === "OWNER" || input.role === "ADMIN";
  return isAuthor || isManager;
}

export function canRemoveMember(input: {
  actingRole: AppRole;
  targetRole: AppRole;
  removingSelf: boolean;
}): boolean {
  if (input.removingSelf) return true;
  if (input.actingRole === "OWNER") return true;
  if (input.actingRole === "ADMIN") {
    return input.targetRole === "MEMBER";
  }
  return false;
}
