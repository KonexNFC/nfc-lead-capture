# KONEX - Smart NFC Digital Business Card Platform

## Overview

KONEX is a full-featured NFC digital business card and lead capture platform. It enables NFC tap → live professional profile → lead capture → analytics flow. Users create digital business cards, share them via NFC cards or QR codes, and capture leads from visitors without requiring a mobile app.

The platform serves three user types:
- **Profile Owners**: Create accounts, manage profiles, activate NFC cards, view analytics, and receive lead notifications
- **Visitors**: Tap NFC cards or scan QR codes to view profiles and submit contact information
- **Admins**: Manage users, card inventory, testimonials, and view platform analytics

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
- Public routes (`/`, `/auth`, `/u/:slug`, `/t/:cardCode`, `/activate/:cardCode`, `/konex-cards`, `/konex-cards/:tierId`) for landing, authentication, public profiles, NFC tap routing, card activation, and product pages
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

### Multi-Profile Support
Users can create and manage multiple digital business cards (e.g., personal, business). Key architecture:
- **Profile Context**: `client/src/hooks/use-active-profile.tsx` - React context providing active profile state, profile list, and CRUD mutations
- **Profile Switcher**: Dropdown in sidebar (`layout-shell.tsx`) lets users switch between profiles or create new ones
- **Active Profile Persistence**: Stored in localStorage (`konex_active_profile_id`) across sessions
- **API Endpoints**:
  - `GET /api/profiles` - list all user's profiles
  - `POST /api/profiles` - create new profile
  - `GET /api/profiles/:id` - get specific profile (ownership validated)
  - `PUT /api/profiles/:id` - update specific profile (ownership validated)
  - `DELETE /api/profiles/:id` - delete profile and its leads (ownership validated)
- **Legacy Compat**: `GET /api/profile` and `PUT /api/profile` still work (first profile)
- **Leads Filtering**: `GET /api/leads?profileId=X` filters by profile; without param returns all with profileName attached
- **Dashboard Pages**: All pages (Dashboard, Edit, Modules, Leads, Cards) use `useActiveProfile()` hook to operate on the currently selected profile
- **Edit Page**: Supports `?new=1` query param for creating new profiles; includes delete profile confirmation dialog

### NFC Card Management System
Physical NFC card tracking, activation, and analytics infrastructure.

#### Database Tables
- `cards`: Physical card registry with cardCode (unique public ID), chipUid (nullable), ownerId, profileId, productTier (basic/premium/elite/custom), status (unassigned/active/suspended/lost/archived), nickname, tapCount, qrScanCount, lastTapAt, activatedAt
- `card_tap_events`: Detailed tap analytics with cardId, ownerId, eventType (nfc_tap/qr_scan/direct_visit), userAgent, referer, ipAddress, country, city, destinationUrl
- `card_assignments_history`: Audit log with cardId, previousOwnerId, newOwnerId, actionType (activated/reassigned/deactivated/suspended/restored), note

#### NFC Tap Router (`/t/:cardCode`)
- Public route that resolves card_code to profile redirect
- Active cards → log tap event, increment counters, redirect to `/u/:slug`
- Unassigned cards → redirect to activation flow
- Suspended/lost cards → show branded inactive page
- Unknown codes → branded 404 page

#### Card Activation Flow (`/activate/:cardCode`)
- Requires authentication (redirects to `/auth?redirect=/activate/:cardCode`)
- Validates card ownership (prevents claiming already-owned cards)
- Assigns card to user, links to primary profile, creates assignment history
- Success screen with navigation to dashboard/cards/profile

#### User Card Routes
- `GET /api/cards/my` - list user's cards
- `POST /api/cards/activate` - activate a card
- `PATCH /api/cards/:id` - update card (nickname, profileId)
- `POST /api/cards/:id/suspend` - suspend a card
- `POST /api/cards/:id/reactivate` - reactivate a card
- `POST /api/cards/:id/lost` - mark card as lost
- `GET /api/cards/:id/analytics` - card tap analytics

#### Admin Card Routes
- `GET /api/admin/cards` - list all cards (with status/tier/search filters)
- `GET /api/admin/cards/stats` - card inventory stats
- `POST /api/admin/cards/batch-create` - batch generate cards (quantity, tier, prefix, nickname pattern)
- `PATCH /api/admin/cards/:id/assign` - assign/reassign card to user
- `PATCH /api/admin/cards/:id/status` - change card status
- `GET /api/admin/cards/export` - export cards as CSV

#### Frontend Pages
- `client/src/pages/tap-router.tsx` - NFC tap resolution page
- `client/src/pages/activate-card.tsx` - Card activation flow
- `client/src/pages/dashboard/cards.tsx` - My Cards management (KPIs, card grid, actions)
- `client/src/pages/dashboard/admin/cards.tsx` - Admin card inventory (batch create, search, assign, export)

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
- `cards`: Physical NFC card inventory (see NFC Card Management System above)
- `card_tap_events`: Tap analytics (see above)
- `card_assignments_history`: Assignment audit log (see above)

### Admin Panel
- Admin users have `isAdmin: true` flag in the users table
- Admin routes: `/api/admin/analytics`, `/api/admin/users`, `/api/admin/users/:id`, `/api/admin/users/:id/profile`, `/api/admin/leads`, `DELETE /api/admin/users/:id`, `/api/admin/growth`, `/api/admin/top-profiles`, `/api/admin/activity`, `PATCH /api/admin/users/:id/toggle-admin`
- Admin card inventory: `/api/admin/cards`, `/api/admin/cards/stats`, `/api/admin/cards/batch-create`, `/api/admin/cards/:id/assign`, `/api/admin/cards/:id/status`, `/api/admin/cards/export`
- Admin middleware checks `req.user.isAdmin` and returns 403 for non-admins
- Frontend admin pages at `/dashboard/admin/*`: overview, user management, all leads, card inventory, testimonials
- Admin link in sidebar only visible to admin users
- Current admin account: info@konexnfc.com
- Admin dashboard uses Recharts for growth area charts (signups and leads over 30 days)
- `ensureAdminAccount()` runs on app startup to reset admin password and ensure admin flag

### Testimonials System
- Users can submit testimonials from their dashboard at `/dashboard/testimonial` (one per user)
- Testimonials require admin approval before appearing on the homepage
- Table: `testimonials` (id, userId, name, title, quote, rating, status, createdAt)
- Status values: `pending` (default), `approved`, `rejected`
- API routes:
  - `POST /api/testimonials` - submit testimonial (authenticated, one per user)
  - `GET /api/testimonials/mine` - get current user's testimonials
  - `GET /api/public/testimonials` - get approved testimonials (public)
  - `GET /api/admin/testimonials` - get all testimonials (admin)
  - `PATCH /api/admin/testimonials/:id` - update status (admin)
  - `DELETE /api/admin/testimonials/:id` - delete testimonial (admin)
- Landing page shows approved testimonials; falls back to 3 static testimonials if none are approved
- "Leave a Review" link in sidebar for all authenticated users

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
