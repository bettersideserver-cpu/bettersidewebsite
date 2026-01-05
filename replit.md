# BetterSide - Immersive Real Estate Experience Platform

## Overview

BetterSide is an immersive real estate experience platform (IPX) that helps users explore pre-launch and under-construction projects in 3D. The platform serves three user types: Channel Partners (real estate agents), Home Buyers/Investors, and Developers. Each role has distinct dashboards and functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool.

**Routing**: Uses Wouter (lightweight React router) for client-side navigation with routes for:
- `/` - Public homepage
- `/login` - Role-based authentication flow
- `/cp-dashboard` - Channel Partner admin panel
- `/developer-dashboard` - Developer admin panel

**UI Components**: Shadcn/ui component library with Radix UI primitives, styled using Tailwind CSS v4. Components follow the "new-york" style variant.

**State Management**: 
- TanStack Query for server state
- Local component state with React hooks
- localStorage for persisting user session data (role, name, company, etc.)

**Design System**:
- Dark theme with blue (#0057FF) and orange (#FF6A00) accents
- Outfit font for headings, Inter for body text
- Cinematic, high-contrast aesthetic

### Backend Architecture

**Server**: Express.js running on Node.js with TypeScript.

**API Structure**: RESTful endpoints under `/api/` prefix:
- `/api/auth/register` - User registration
- `/api/auth/login` - User authentication  
- `/api/auth/logout` - Session termination
- `/api/auth/me` - Current user retrieval

**Session Management**: Express-session with PostgreSQL store (connect-pg-simple) for persistent sessions.

**Authentication**: Password hashing with bcryptjs, session-based auth stored in cookies.

### Data Storage

**Database**: PostgreSQL with Drizzle ORM.

**Schema** (in `shared/schema.ts`):
- `users` table with fields for all three roles (buyer, cp, developer)
- Role-specific fields: companyName (CP), contactPerson/gstNumber/reraNumber (Developer), budget (Buyer)

**Migrations**: Managed via `drizzle-kit push` command.

### Admin Panel Architecture

Both CP and Developer dashboards use tab-based navigation within a single page layout (no sub-routes). Active tab state is managed locally to prevent 404 errors.

**Channel Partner Panel Tabs**: Dashboard, Leads, Run Ads, Marketing Support, Profile

**Developer Panel Tabs**: Dashboard, Projects, Channel Partners, Invite CPs, Marketing & Ads, Profile

Mock data is used extensively for demonstration (`mockDeveloperData.ts`).

## External Dependencies

**Database**: PostgreSQL (required - connection via DATABASE_URL environment variable)

**UI Libraries**:
- Radix UI - Accessible component primitives
- Shadcn/ui - Pre-built component designs
- Tailwind CSS v4 - Utility-first styling
- Lucide React - Icon library

**Build Tools**:
- Vite - Development server and bundler
- esbuild - Production server bundling
- TypeScript - Type checking

**Session Storage**: connect-pg-simple for PostgreSQL session store

**Form Handling**: React Hook Form with Zod validation (drizzle-zod for schema integration)

**Fonts**: Google Fonts (Outfit, Inter) loaded via CDN