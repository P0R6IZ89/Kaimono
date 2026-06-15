# Kaimono - Multi-Tenant Shopping List Management

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.x-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748)

![Scheenshot](public/images/home.png)

Kaimono is a localized, multi-tenant shopping and purchase-planning application
for families, shared households, and collaborative groups. Each workspace is
isolated by subdomain and includes essentials, planned purchases, projects,
member collaboration, optional two-factor authentication, and AI-assisted
product extraction from URLs.

## Website

URL: https://p0r6iz89.cloud

## Features

- Multi-tenant workspaces with subdomain-based routing.
- Role-based memberships with `OWNER`, `ADMIN`, and `MEMBER` roles.
- Essentials for recurring or quick shopping items.
- Planned purchases with priority, quantity, price, image, product URL, description, comments, and likes.
- Projects for grouping planned purchases by goal or context.
- Email invitations with token-based acceptance and expiration.
- TOTP two-factor authentication with encrypted secrets and single-use recovery codes.
- Localized routing and translations for English, Japanese, and Portuguese.
- Product URL extraction using structured metadata, Cheerio, OpenAI, and Cloudinary.
- Public URL validation, redirect and response limits, and optional Upstash Redis rate limiting for AI extraction.
- Append-only AI credit accounting with 20 free signup credits and a one-credit extraction cost.
- Stripe Checkout credit packs with signed, idempotent webhook fulfillment.
- Authenticated workspace contact support through Resend with optional rate limiting.
- Automatic demo workspace creation for new users.
- Responsive UI built with shadcn/ui, Radix UI, Tailwind CSS v4, and Lucide icons.

## Tech Stack

### Application

- [Next.js 15](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/)
- [next-intl](https://next-intl.dev/) for locale-aware routing and translations
- [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/) for forms and validation

### Backend and Services

- [Auth.js / NextAuth.js v5](https://authjs.dev/) with GitHub, Google, and Resend email providers
- [Prisma ORM 6](https://www.prisma.io/) with PostgreSQL
- [Resend](https://resend.com/) for login, invitation, and contact emails
- [Cloudinary](https://cloudinary.com/) for product image uploads
- [OpenAI](https://openai.com/) for product metadata extraction
- [Stripe Checkout](https://stripe.com/payments/checkout) for AI credit purchases
- [Upstash Redis](https://upstash.com/) for optional AI extraction and contact rate limiting
- [otplib](https://github.com/yeojz/otplib) and QRCode for TOTP two-factor authentication
- [Vercel](https://vercel.com/) for hosting and scheduled cron execution

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL, either local or through Docker Compose

### 1. Install Dependencies

```bash
npm install
```

`postinstall` runs `prisma generate`, so the Prisma client is generated automatically after installation.

### 2. Configure Environment Variables

Create `.env` with the variables below. The Prisma CLI reads this file for migration commands, and it is ignored by `.gitignore`. Use `.env.local` only for Next.js-specific local overrides. Do not commit local environment files or real secret values.

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/dev-db"
DIRECT_URL="postgresql://postgres:password@localhost:5432/dev-db"

# Auth.js / NextAuth v5
AUTH_SECRET="replace-with-a-random-secret"
AUTH_URL="http://localhost:3000"

# OAuth providers
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Legacy OAuth aliases also supported by auth.config.ts
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email
AUTH_RESEND_KEY="your-resend-api-key"
LOGIN_FROM_EMAIL="login@yourdomain.com"
INVITE_FROM_EMAIL="invites@yourdomain.com"
CONTACT_FROM_EMAIL="support@yourdomain.com"
CONTACT_TO_EMAIL="support@yourdomain.com"

# Domains, server actions, and cron
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
NEXT_PUBLIC_ALLOWED_ORIGINS=""
ALLOWED_ORIGINS=""
CRON_SECRET="replace-with-a-cron-secret"
KILL_SWITCH=""

# Two-factor authentication
# Uses AUTH_SECRET as a fallback when this is omitted.
TWO_FACTOR_SECRET_KEY="replace-with-a-dedicated-random-secret"

# Product images and extraction
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
OPENAI_API_KEY="your-openai-api-key"
AI_EXTRACT_DEBUG="false"

# Optional rate limiting for AI extraction and contact support
UPSTASH_REDIS_REST_URL="your-upstash-redis-rest-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-rest-token"

# AI credit purchases
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# Optional Ko-fi widget
NEXT_PUBLIC_KOFI_CODE="your-kofi-code"
```

Notes:

- `NEXT_PUBLIC_ALLOWED_ORIGINS` or `ALLOWED_ORIGINS` can override the default server action origins derived from `NEXT_PUBLIC_ROOT_DOMAIN`.
- `TWO_FACTOR_SECRET_KEY` should remain stable after users enable two-factor authentication. Changing it prevents existing TOTP secrets and recovery codes from being read.
- Upstash Redis is optional. Without it, AI extraction and contact support operate without Redis-backed rate limiting.
- Stripe variables are required only when AI credit purchases are enabled.
- `KILL_SWITCH` returns HTTP 503 for middleware-managed application routes when set to a non-empty value.
- Enable `AI_EXTRACT_DEBUG` only for controlled debugging; extraction errors may include additional diagnostic context.

### 3. Start PostgreSQL

The included Compose file starts PostgreSQL only; it does not run the Next.js app.

```bash
docker compose up -d db
```

The database service uses:

- Image: `postgres:15-alpine`
- Container: `kaimono`
- Database: `dev-db`
- Port: `5432`
- Password: `password`

### 4. Run Migrations

```bash
npx prisma migrate dev
```

Run `npx prisma generate` manually only if you need to regenerate the client outside of `npm install` or migration workflows.

### 5. Start the App

```bash
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000). The dev server binds to `0.0.0.0` through the `dev` script.

## Available Scripts

```bash
npm run dev            # Start the Next.js dev server on 0.0.0.0
npm run build          # Build the Next.js app
npm run vercel-build   # Run prisma generate, prisma migrate deploy, and next build
npm run start          # Start the production server
npm run lint           # Run Next.js ESLint
npm run postinstall    # Generate the Prisma client
```

Database commands:

```bash
npx prisma generate        # Generate Prisma client files
npx prisma migrate dev     # Create and apply development migrations
npx prisma migrate deploy  # Apply committed migrations in production
npx prisma studio          # Open Prisma Studio
```

## Deployment

### Vercel

1. Connect the repository to Vercel.
2. Configure the required environment variables in the Vercel project settings.
3. Use `npm run vercel-build` as the build command so Prisma generation, migration deployment, and `next build` run together.
4. Set `AUTH_URL` and `NEXT_PUBLIC_ROOT_DOMAIN` to the production domain.
5. Configure OAuth callback URLs for the production domain.
6. Configure the cron secret used by `/api/cron/expire-invites`.
7. Configure the Stripe webhook endpoint as `/api/stripe/webhook` and subscribe
   it to Checkout completion events when AI credit purchases are enabled.
8. Keep `AUTH_SECRET` and `TWO_FACTOR_SECRET_KEY` stable across deployments.

`vercel.json` schedules the invitation expiration job at `/api/cron/expire-invites` with the cron expression `0 0 */2 * *`.

### Docker

`compose.yaml` is intended for local PostgreSQL. There is no application image or `Dockerfile` in the current repository, so run the app locally with `npm run dev` or deploy it through Vercel.

## Project Structure

```text
app/          Next.js App Router routes, layouts, API routes, and locale segments
actions/      Server actions for auth, apps, memberships, invitations, and shopping data
components/   Shared UI, auth, navigation, sidebar, dialog, skeleton, and client components
context/      React context providers
hooks/        Shared React hooks
i18n/         next-intl request, routing, and navigation helpers
lib/          Prisma, Cloudinary, rate limiting, validation, formatting, and utility modules
locales/      Translation messages for en, ja, and pt
prisma/       Prisma schema, generated client, config, and migrations
public/       Static assets
types/        Project-wide TypeScript augmentation
```

See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for the route map, feature data
flows, authorization boundaries, external service behavior, and implementation
cautions intended for maintainers and AI agents.

## Data Model

The Prisma schema centers on these models:

- `User`, `Account`, `Session`, `VerificationToken`, and `Authenticator` for Auth.js data.
- `UserTwoFactor` and `TwoFactorRecoveryCode` for TOTP and recovery-code security.
- `App` for each tenant workspace.
- `Membership` for user access and role assignment.
- `Invitation` for pending, accepted, revoked, and expired workspace invitations.
- `Essential` for basic shopping list entries.
- `Planned` for richer planned purchase records.
- `Project` for grouping planned items.
- `PlannedComment` and `PlannedLike` for collaboration on planned purchases.
- `AiCreditLedger` for append-only credit purchases, deductions, refunds, and adjustments.

## Security and Operational Notes

- Tenant-owned actions should verify membership and constrain data by `appId`.
- The product extraction route blocks local and private network targets and
  revalidates redirects before fetching.
- Stripe webhook processing requires a valid signature and uses unique ledger
  external IDs to prevent duplicate credit grants.
- Development cookies are host-only. `localhost:3000` and
  `<subdomain>.localhost:3000` may hold different sessions.
- No automated test framework is currently configured. Use lint, TypeScript,
  and production build validation for changes.

## Internationalization

The app uses `next-intl` with locale-aware routes under `app/[locale]`.

Supported locales:

- `en` - English
- `ja` - Japanese
- `pt` - Portuguese

Use `useTranslations` in client components and `getTranslations` in server components.

```typescript
import { useTranslations } from "next-intl";

export function Example() {
  const t = useTranslations("Example");
  return <h1>{t("title")}</h1>;
}
```

```typescript
import { getTranslations } from "next-intl/server";

export default async function ExamplePage() {
  const t = await getTranslations("Example");
  return <h1>{t("title")}</h1>;
}
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Auth.js](https://authjs.dev/)
