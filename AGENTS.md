# Agent Guidelines for to-buy-pj

## Commands

- **Build**: `npm run build` (Next.js production build)
- **Lint**: `npm run lint` (ESLint configuration)
- **Dev**: `npm run dev` (Starts dev server on 0.0.0.0)
- **Database**: `npx prisma generate` (after schema changes)
- **Testing**: No test framework is currently configured. Do not attempt to run tests.

## Code Style & Conventions

- **Imports**: Always use the `@/` alias for internal imports (e.g., `@/lib/utils`, `@/components/ui/button`).
- **Formatting**: Follow Prettier defaults. Use 2 spaces for indentation.
- **Naming**: Use `camelCase` for functions/variables, `PascalCase` for components/interfaces.
- **Types**: Strict TypeScript. Explicitly type server action return values.
- **Server Actions**:
  - Must start with `"use server"`.
  - Return `Promise<Result<T>>` pattern: `{ ok: boolean; message?: string; data?: T }`.
  - Use `zod` for input validation.
- **UI Components**:
  - Use `shadcn/ui` components from `@/components/ui`.
  - Styling: Tailwind CSS v4. Use `cn()` for class merging.
- **Database**: Use the singleton instance from `@/lib/prisma`.
- **Internationalization**: This project uses `next-intl`. Be aware of `[locale]` routing.
