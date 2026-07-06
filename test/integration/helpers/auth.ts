import { auth } from "@/auth";
import type { User } from "@/prisma/generated/prisma";
import { vi } from "vitest";

export function mockSession(user: User) {
  vi.mocked(auth).mockResolvedValue({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
  } as never);
}
