import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: ["test/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
    // Integration tests share one physical test database and clean it between tests.
    fileParallelism: false,
  },
});
