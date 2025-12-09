# Kaimono (買い物) - Multi-Tenant Shopping List Management

![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-green.svg)

A sophisticated, collaborative shopping list management application designed for teams, families, and projects. Kaimono (Japanese for "shopping") provides a multi-tenant platform where users can organize their purchasing needs across different contexts with powerful collaboration features.

## ✨ Key Features

- **🏢 Multi-Tenant Architecture** - Subdomain-based isolation for unlimited teams/apps
- **🛒 Smart Shopping Organization** - Three-tier hierarchy: Essentials, Planned Items, and Projects
- **👥 Team Collaboration** - Invite members, assign roles, comment, and like items
- **📊 Analytics Dashboard** - Spending trends and purchase tracking with visual charts
- **🌍 Multi-Language Support** - English, Japanese, and Portuguese
- **🔐 Secure Authentication** - Multi-provider auth (GitHub, Google, Email)
- **📱 Responsive Design** - Mobile-first approach with adaptive layouts
- **🎨 Modern UI** - Built with shadcn/ui components and Tailwind CSS v4

## 🚀 Live Demo

Coming soon! The application is currently in active development.

## 🛠 Technology Stack

### Frontend

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Strict typing throughout
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library built on Radix UI
- **[Recharts](https://recharts.org/)** - Data visualization and charting
- **[React Hook Form](https://react-hook-form.com/)** - Form management with Zod validation
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend

- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Server-side functionality
- **[Prisma ORM](https://www.prisma.io/)** - Database abstraction with PostgreSQL
- **[NextAuth.js v5](https://authjs.dev/)** - Authentication with multiple providers
- **[Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)** - React server-side data mutations
- **[Resend](https://resend.com/)** - Email service for invitations

### Database & Infrastructure

- **[PostgreSQL](https://www.postgresql.org/)** - Primary database with complex relational schema
- **[Docker](https://www.docker.com/)** - Containerized deployment
- **[Vercel](https://vercel.com/)** - Cloud hosting with subdomain support
- **[Cloudinary](https://cloudinary.com/)** - Image management

## 📋 Core Features

### 🏢 Multi-Tenant Architecture

- **Subdomain Isolation**: Each team gets its own subdomain (e.g., `home.example.com`, `office.example.com`)
- **App Creation**: Create multiple "apps" to separate different shopping contexts
- **Team Management**: Role-based access control (OWNER, ADMIN, MEMBER)

### 🛒 Shopping Management

- **Essentials**: Regular must-have items with basic tracking (title, price, quantity, status)
- **Planned Items**: Detailed purchases with priority levels, images, product URLs, and descriptions
- **Projects**: Group planned items into specific projects for better organization
- **Status Tracking**: Items can be PENDING, PURCHASED, or CANCELLED

### 👥 Collaboration Features

- **Comments**: Discuss planned items with team members
- **Likes**: Simple like system for planned purchases
- **Member Management**: View and manage team members
- **Invitation System**: Email-based invitations with token verification and expiration

### 📊 Analytics & Visualization

- **Dashboard**: Quick overview cards showing counts for essentials, planned items, and projects
- **Spending Trends**: Visual representation of purchase patterns over time
- **Progress Tracking**: Monitor shopping goals and budget adherence

## 🗄 Database Schema

The application uses a sophisticated relational schema with the following key models:

### Core Models

- **User**: Authentication and user profile data
- **App**: Multi-tenant container for teams/projects
- **Membership**: Junction table for user-app relationships with roles
- **Invitation**: Pending and historic team invitations

### Shopping Models

- **Essential**: Basic shopping items with title, price, quantity, and status
- **Planned**: Detailed purchase items with priority, images, URLs, and descriptions
- **Project**: Container for grouping related planned items
- **PlannedComment**: Comments on planned items
- **PlannedLike**: Like system for planned purchases

### Key Enums

- **Role**: OWNER, ADMIN, MEMBER
- **Status**: PENDING, PURCHASED, CANCELLED
- **Priority**: LOW, MEDIUM, HIGH, URGENT
- **InvitationStatus**: PENDING, ACCEPTED, REVOKED, EXPIRED

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - Runtime environment
- **PostgreSQL** - Database server
- **npm** or **yarn** - Package manager

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/to-buy-pj.git
   cd to-buy-pj
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:

   ```env
    # Database
    DATABASE_URL="postgresql://username:password@localhost:5432/kaimono"
    DIRECT_URL="postgresql://username:password@localhost:5432/kaimono"
    SHADOW_DATABASE_URL="postgresql://username:password@localhost:5432/kaimono_shadow"

    # Auth.js (NextAuth v5)
    AUTH_SECRET="your-auth-secret"
    AUTH_URL="http://localhost:3000"

    # OAuth Providers (Optional)
    GITHUB_CLIENT_ID="your-github-client-id"
    GITHUB_CLIENT_SECRET="your-github-client-secret"
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"

    # Email & Resend
    AUTH_RESEND_KEY="your-resend-api-key"
    LOGIN_FROM_EMAIL="login@yourdomain.com"
    INVITE_FROM_EMAIL="invites@yourdomain.com"
    INVITE_LOGIN_FROM_EMAIL="reminders@yourdomain.com"

    # Domain, Cron & Feature Flags
    NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
    CRON_SECRET="super-secure-cron-token"
    KILL_SWITCH="" # set to any truthy value to force 503s

    # Image Upload (Optional)
    NEXT_PUBLIC_CLOUDINARY_API_KEY="your-cloudinary-api-key"
    CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

> ℹ️ Cloudinary's `cloud_name` is currently configured directly in `lib/cloudinary.ts`. Update that file if you need to target a different Cloudinary account.

4. **Database Setup**


   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Seed database with sample data
   npm run seed
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

## 🐳 Docker Deployment

### Using Docker Compose

1. **Build and run with Docker Compose**

   ```bash
   docker compose up --build
   ```

2. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Database: [localhost:5432](localhost:5432)

### Manual Docker Build

1. **Build the image**

   ```bash
   docker build -t kaimono .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 --env-file .env.local kaimono
   ```

## ☁️ Vercel Deployment

### Prerequisites

- **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
- **GitHub Repository** - Connect your repo to Vercel
- **PostgreSQL Database** - Use Vercel Postgres or external provider

### Deployment Steps

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect the Next.js framework

2. **Configure Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Ensure `NEXTAUTH_URL` is set to your Vercel domain

3. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-app.vercel.app`

4. **Configure Custom Domain** (Optional)
   - Add your custom domain in Vercel dashboard
   - Update DNS records as instructed

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate dev  # Run migrations in development
npx prisma migrate deploy  # Deploy migrations in production
npx prisma studio    # Open Prisma Studio
```

### Project Structure

```
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
│   ├── auth/              # Authentication components
│   ├── client/            # Client-side components
│   ├── dialog/            # Dialog components
│   ├── graph/             # Chart components
│   ├── sidebar/          # Navigation components
│   └── ui/               # shadcn/ui components
├── actions/               # Server actions
├── context/              # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
├── locales/              # Internationalization files
└── public/               # Static assets
```

## 🌍 Internationalization

The application supports multiple languages using [next-intl](https://next-intl-docs.vercel.app/):

### Supported Languages

- **English (en)** - Default locale
- **Japanese (ja)** - Native support
- **Portuguese (pt)** - Additional language

### Translation Usage

```typescript
// In components
import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('MyComponent')
  return <h1>{t('title')}</h1>
}

// In server components
import { getTranslations } from 'next-intl/server'

export default async function MyServerComponent() {
  const t = await getTranslations('MyComponent')
  return <h1>{t('title')}</h1>
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What the MIT License Allows

✅ **Commercial Use** - You can use this software in commercial products  
✅ **Modification** - You can modify the source code  
✅ **Distribution** - You can distribute copies of the software  
✅ **Private Use** - You can use the software privately without disclosing changes  
✅ **Sublicensing** - You can license your derivative works under different terms

### Third-Party Notices

This project relies on the open-source packages listed in `package.json`. Refer to each dependency's repository or npm listing for the most accurate licensing details; all current dependencies are compatible with the MIT License.

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - The React framework
- **[Prisma](https://www.prisma.io/)** - Modern database toolkit
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[NextAuth.js](https://authjs.dev/)** - Authentication for Next.js
