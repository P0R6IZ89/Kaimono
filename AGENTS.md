# Agent Guidelines for to-buy-pj

## Commands

- **Dev**: `npm run dev` (Starts dev server on 0.0.0.0)
- **Build**: `npm run build` (Next.js production build)
- **Start**: `npm run start` (Runs the production server)
- **Lint**: `npm run lint` (ESLint via Next.js)
- **Vercel Build**: `npm run vercel-build` (Runs `prisma generate`, `prisma migrate deploy`, and `next build`)
- **Postinstall**: `npm install` automatically runs `prisma generate`

### Database

- **Generate Client**: `npx prisma generate`
- **Migrate (Dev)**: `npx prisma migrate dev`
- **Migrate (Prod)**: `npx prisma migrate deploy`
- **Studio**: `npx prisma studio`
- **Testing**: No test framework is currently configured. Do not attempt to run tests.

## Workflows

### Local Development

1. Run `npm install` to install dependencies and trigger Prisma client generation.
2. Run `npx prisma migrate dev` to apply local migrations.
3. Run `npm run dev` to start the app.

### Prisma Schema Changes

1. Update `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <migration_name>` to create/apply the migration.
3. Run `npx prisma generate` if Prisma client types need regeneration.
4. Commit both schema and generated migration files.

### Production / Vercel Build Validation

1. Ensure migrations are committed.
2. Run `npm run vercel-build` to validate production build steps locally.

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
