# KONEX - Digital Business Card Platform

## Overview

KONEX is a web-based MVP that enables NFC tap → live professional profile → lead capture → basic analytics flow. Users can create digital business cards, share them via NFC or QR codes, and capture leads from visitors without requiring a mobile app.

The platform serves two user types:
- **Profile Owners**: Create accounts, manage profiles, view analytics, and receive lead notifications
- **Visitors**: Tap NFC cards or scan QR codes to view profiles and submit contact information

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite with HMR support

The frontend follows a feature-based structure with:
- Public routes (`/`, `/auth`, `/u/:slug`) for landing, authentication, and public profiles
- Protected routes (`/dashboard/*`) wrapped in `LayoutShell` with sidebar navigation
- Custom hooks for auth, profiles, leads, and file uploads

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Authentication**: Passport.js with local strategy (email/password)
- **Sessions**: Express-session with PostgreSQL store (connect-pg-simple)
- **API Design**: RESTful endpoints under `/api/*`

Key server components:
- `server/routes.ts`: API route definitions with Zod validation
- `server/storage.ts`: Database abstraction layer
- `server/auth.ts`: Authentication setup with password hashing (scrypt)

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit (`drizzle-kit push`)

Core tables:
- `users`: Authentication (email, hashed password)
- `profiles`: Digital business cards (name, title, company, bio, links, theme, slug, views)
- `leads`: Captured contacts (name, telephone, whatsapp, email, company, note, source)

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod schemas
- `routes.ts`: API contract definitions with type-safe request/response schemas

### File Uploads
- **Storage**: Google Cloud Storage via Replit Object Storage integration
- **Upload Flow**: Presigned URL pattern with Uppy dashboard
- **Routes**: `/api/uploads/request-url` for presigned URLs, `/objects/uploads/:id` for serving

### Contact Card & vCard
After a visitor submits the lead capture form, they see an iOS-style contact card with:
- Profile owner's info (name, title, company, phone)
- Quick action buttons: Message (sms:), Call (tel:), WhatsApp (wa.me), Email (mailto:)
- Social links: Facebook, X, LinkedIn, Instagram, TikTok
- "Save Contact" button that downloads a vCard (.vcf) file

Key files:
- `client/src/lib/vcard.ts`: vCard 3.0 generation utility
- `client/src/components/contact-card.tsx`: iOS-style contact card component

## External Dependencies

### Database
- PostgreSQL via `DATABASE_URL` environment variable
- Drizzle ORM for queries and migrations

### Cloud Storage
- Google Cloud Storage through Replit's sidecar proxy (`http://127.0.0.1:1106`)
- Used for profile photo uploads

### Authentication
- Session-based auth with cookies
- Session secret via `SESSION_SECRET` environment variable

### UI Libraries
- Radix UI for accessible primitives
- Uppy for file upload interface
- Recharts for analytics visualization
- Lucide React for icons

### Build & Development
- Vite for frontend bundling with React plugin
- esbuild for server bundling
- TSX for TypeScript execution in development

## Future Enhancements

### Email Notifications (Not Yet Implemented)
Email notifications for lead capture are not yet integrated. Currently, lead notifications are logged to the console:
```
[EMAIL MOCK] Notification to profile owner {userId}: New lead from {name} ({email})
```
To implement email notifications in the future:
1. Set up Resend or SendGrid integration via Replit's connector system
2. Replace the console.log in `server/routes.ts` lead submission handler with actual email sending
3. Store the profile owner's email and send notifications when new leads are captured