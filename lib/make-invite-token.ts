import { randomBytes } from "crypto";

export function makeInviteToken() {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000); // 9 days
  return { token, expiresAt };
}
