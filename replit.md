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
- Admin routes (`/dashboard/admin/*`) visible only to users with `isAdmin` flag
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
- `profiles`: Digital business cards with modular features
  - Basic fields: name, title, company, bio, photoUrl, slug, theme, views
  - `links` (jsonb): Social/contact links (phone, whatsapp, email, linkedin, facebook, instagram, x, tiktok, youtube, snapchat, website)
  - `modules` (jsonb): Modular features - tiles (custom links/PDFs), videoUrl, bookingUrl/bookingLabel, reviews, address
  - `branding` (jsonb): Visual customization - logoUrl, heroUrl, heroVideoUrl, primaryColor, accentColor, fontFamily
  - `textOverrides` (jsonb): Multilingual text - headline, subheadline, ctaLabel, bioOverride, locale
- `leads`: Captured contacts (name, telephone, whatsapp, email, company, note, source)

### Admin Panel
- Admin users have `isAdmin: true` flag in the users table
- Admin routes: `/api/admin/analytics`, `/api/admin/users`, `/api/admin/users/:id`, `/api/admin/users/:id/profile`, `/api/admin/leads`, `DELETE /api/admin/users/:id`, `/api/admin/growth`, `/api/admin/top-profiles`, `/api/admin/activity`, `PATCH /api/admin/users/:id/toggle-admin`
- Admin middleware checks `req.user.isAdmin` and returns 403 for non-admins
- Frontend admin pages at `/dashboard/admin/*`: overview (with growth charts, top profiles, recent activity), user management (with search/filter/toggle admin), all leads (with search/filter/CSV export)
- Admin link in sidebar only visible to admin users
- Current admin account: info@konexnfc.com
- Admin dashboard uses Recharts for growth area charts (signups and leads over 30 days)
- Users page supports search by email/name/company and filter by role (all/admin/user/no-profile)
- Leads page supports search by name/email/company/phone and filter by source (nfc/qr/etc)
- Admin can toggle other users' admin status via shield icon (with confirmation dialog)
- `ensureAdminAccount()` runs on app startup to reset admin password and ensure admin flag

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

### Email Notifications
- **Provider**: SendGrid via Replit connector (connection:conn_sendgrid_01KGTZG5GDMAJN99QWA90VEKZM)
- **Module**: `server/email.ts` - SendGrid client setup and email templates
- **Password Reset**: HTML email with reset button link, sent when user requests password reset
- **Lead Notifications**: HTML email with lead details (name, contact info, company, note) sent to profile owner when a new lead is captured
- **Error Handling**: Email failures are caught and logged but don't block API responses (fire-and-forget pattern)
- **Authentication**: API key managed via Replit connector, never cached per integration guidelines