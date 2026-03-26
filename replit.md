# KONEX - Smart NFC Digital Business Card Platform

## Overview

KONEX is a comprehensive platform for NFC digital business cards and lead capture. It facilitates a flow from NFC tap to a live professional profile, enabling lead capture and analytics. Users can create, share (via NFC or QR), and manage their digital business cards, capturing leads without requiring visitors to download an app. The platform supports Profile Owners, Visitors, and Admins, offering functionalities like profile management, lead notifications, card activation, and system administration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Structure**: Feature-based, with public, protected, and admin routes.

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Authentication**: Passport.js (local strategy)
- **Sessions**: Express-session with PostgreSQL store
- **API Design**: RESTful endpoints with Zod validation.

### Multi-Profile Support
Users can manage multiple digital business cards. The system allows switching between profiles, with active profile persistence and dedicated API endpoints for CRUD operations on profiles. Leads can be filtered by profile.

### NFC Card Management System
This system handles the lifecycle of physical NFC cards, including tracking, activation, and analytics.
- **Database Tables**: `cards` (card registry), `card_tap_events` (tap analytics), `card_assignments_history` (audit log).
- **NFC Tap Router**: Resolves `/t/:cardCode` to profile redirects, activation flows, or inactive pages based on card status.
- **Card Activation Flow**: Authenticated process to assign a physical card to a user and link it to a profile.
- **API Routes**: Comprehensive API for user and admin management of cards, including activation, status changes, assignments, and analytics.

### Database
- **ORM**: Drizzle ORM with PostgreSQL.
- **Schema**: Defined in `shared/schema.ts`, managed with Drizzle Kit migrations.
- **Core Tables**: `users`, `profiles` (with modular `links`, `modules`, `branding`, `textOverrides` JSON fields), `leads`, `cards`, `card_tap_events`, `card_assignments_history`, `organizations`, `organization_members`, `organization_invitations`, `organization_cards`.

### Organization System
Enables users to create and manage organizations, invite members with role-based permissions (owner, admin, manager, member), and assign cards to organizations. Provides organization-level analytics.

### Admin Panel
Accessible to users with `isAdmin: true`. Includes routes for analytics, user management, lead management, card inventory, growth metrics, and activity monitoring. Features batch card creation, assignment, and status updates, along with data export.

### Testimonials System
Allows users to submit testimonials, which require admin approval before public display. Includes API endpoints for submission, retrieval, and admin moderation.

### Profile Themes & Appearance System
Users can customize their public profile appearance through an "Appearance" dashboard page.
- **Themes**: Four predefined themes (`minimal_corporate`, `personal_brand`, `luxury_black`, `social_hub`). Default: `social_hub`.
- **Layout Variants**: Each theme has a genuinely distinct structural layout variant (`corporate`=compact row header, `personal`=large avatar + gradient banner, `luxury`=cinematic dark header with gold accent ring, `social`=dark tiles + large contact circles). Applied in `ProfilePreview`.
- **8 Customization Controls** (all themes): accent color (with presets), background style (flat/gradient/pattern), button style (filled/outline/pill), font style (modern/elegant/bold), profile image shape (circle/squircle/square), card radius (sharp/soft/rounded), section dividers (none/line/gradient), icon style (solid/outline/ghost).
- **Token System**: `buildThemeCssVars()` in `themes.ts` generates all CSS variables (including Tailwind HSL bridges). Used by both the appearance preview and the public profile page, ensuring preview exactly matches reality.
- **Live Preview**: The appearance editor uses the actual `ProfilePreview` component wrapped in a CSS-variable scope div — no separate preview renderer. Desktop/mobile viewport toggle.
- **Workflow**: Draft/publish pattern — save draft to iterate, publish when ready. Status badge shows unsaved/draft/live state.
- **Premium Gating**: `luxury_black` and `social_hub` require pro plan.
- **Architecture**: `hexToHslVar()` shared in `themes.ts`. `resolveCustomizations()` merges saved customizations over theme defaults.

### Analytics & Conversion Tracking System
- **`profile_events` table**: Tracks all profile interaction events (view, cta_click, call_click, email_click, whatsapp_click, website_click, social_click, booking_click, save_contact, form_submit, qr_scan, payment_click).
- **Public tracking endpoint**: `POST /api/public/track` — rate-limited (30 req/min/IP), fire-and-forget from public profile page.
- **Analytics API**: `GET /api/analytics/overview`, `/trend?days=N`, `/ctas`, `/sources` — all authenticated.
- **Analytics Dashboard**: `/dashboard/analytics` — stat cards, trend chart (Recharts), CTA performance bar chart, traffic source pie chart, ROI messaging, leads CTA.
- **Event tracking on public profile**: View tracked on mount with referrer source detection; all contact/social link clicks tracked via event delegation; CTA button click tracked directly.
- **Sticky mobile action bar**: Fixed bottom bar on mobile with primary CTA button, respects safe-area-inset.

### Shared Code
The `shared/` directory contains common code for frontend and backend, including Drizzle schemas and Zod-based API route definitions for type safety.

### File Uploads
Utilizes Google Cloud Storage (via Replit Object Storage) with a presigned URL pattern for secure file uploads, primarily for profile photos.

### Contact Card & vCard
Visitors who submit a lead form are presented with an iOS-style contact card, including profile owner's details, quick action buttons (message, call, WhatsApp, email), social links, and a "Save Contact" button to download a vCard (.vcf) file.

## External Dependencies

- **Database**: PostgreSQL (via `DATABASE_URL`).
- **Cloud Storage**: Google Cloud Storage (via Replit Object Storage integration) for profile photo uploads.
- **Authentication**: Session-based with cookies, `SESSION_SECRET` environment variable.
- **UI Libraries**: Radix UI, Uppy (for file uploads), Recharts (for analytics), Lucide React (for icons).
- **Build & Development**: Vite (frontend), esbuild (server), TSX (TypeScript execution).
- **Email Notifications**: SendGrid (via Replit connector) for password resets and lead notifications. Implements a fire-and-forget pattern for email sending.