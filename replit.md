# KONEX - Smart NFC Digital Business Card Platform

## Overview

KONEX is an NFC-powered connection and conversion platform. It turns every tap into a business opportunity — from NFC card tap to live professional profile, real-time lead capture, and analytics. Users can create, share (via NFC or QR), and manage their digital business cards, capturing leads without requiring visitors to download an app. The platform supports individual professionals, teams/enterprises (via Organizations), and Admins.

### Homepage Positioning
The public landing page (`/`) is conversion-focused, positioned as "Turn every tap into a business opportunity." It includes: hero with dual CTAs, trust strip (10K+ profiles, 500K+ taps, 3× lead improvement, 500+ teams), 4-step How It Works, 3 use case segments (Sales Teams, Real Estate, Founders), 6 feature blocks, ROI statistics section (88% profile completion, 3× more leads, £0 app cost), testimonials carousel, and footer CTA.

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

### Enterprise / Organization System
Enables admin users to create organizations. Regular users can be invited into orgs by admins. Full team management workflow:
- **Roles**: owner, admin, manager, member — with granular permissions
- **Card Management**: Assign/reassign physical NFC cards to org members via the Org Cards page. Filter cards by status (All/Assigned/Unassigned/Active). Status summary stat cards.
- **Team Analytics**: Per-member performance table on org dashboard (`/dashboard/organization`) showing taps, leads, and activation status for each member. Data via `GET /api/organizations/:id/member-analytics`.
- **Org Branding Defaults**: Settings page lets org owners set a default branding color (8 presets + custom picker) and default theme for all org member cards. Stored in `branding_color` and `default_theme` columns on `organizations` table.
- **API Routes**: `PATCH /api/organizations/:id/cards/:orgCardId` (card reassignment), `GET /api/organizations/:id/member-analytics` (per-member analytics breakdown).
- **Sidebar**: Organization link is always visible in the sidebar for all logged-in users (not conditional on having an org).

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
- **Themes available**: `minimal_corporate` (free), `personal_brand` (free), `luxury_black` (pro), `social_hub` (pro), `rose_gold` (pro), `ocean` (pro), `neon_night` (pro).
- **Premium Gating**: All except `minimal_corporate` and `personal_brand` require pro plan.
- **Architecture**: `hexToHslVar()` shared in `themes.ts`. `resolveCustomizations()` merges saved customizations over theme defaults.

### Checkout & Product Catalog
- **Checkout page** (`/checkout`): Multi-variant product selection with card mockup images, variant swatches (finish/material options), and selected-card live preview.
- **Engraving**: Two optional fields (name line + title line, 30 chars each) rendered as `PenLine` icon inputs. Text is appended to the PayPal order description via `engravingText` prop on `<PayPalButton>` and passed through `createPayPalOrder()`.
- **Product SKUs** (in `server/paypal.ts`): `KONEX-BASIC`, `KONEX-PREMIUM-BLACK`, `KONEX-PREMIUM-COPPER`, `KONEX-ELITE-GOLD`, `KONEX-ELITE-CARBON-GOLD` (available now); `KONEX-ECO-BAMBOO`, `KONEX-ECO-STEEL`, `KONEX-EINК` (coming soon).
- **Coming-soon flow**: Selecting an eco or e-ink SKU hides the PayPal button and shows an email waitlist form instead. Waitlist submissions call `POST /api/waitlist` (logs email + product server-side; no DB storage).
- **Upcoming cards section**: `<KonexUpcomingCards />` component on `/konex-cards` page shows CSS-styled placeholder visuals for Bamboo, Recycled Steel, and E-Ink cards.

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

### Dashboard Enhancements
- **Profile Completion Score**: A stat card on the dashboard calculates and displays a profile completeness percentage (0–100%) based on 7 weighted fields: photo (20), title (15), company (10), bio (15), contact link (20), social link (10), appearance customised (10). Includes a progress bar and link to remaining steps.
- **Onboarding Checklist**: A dismissible card shown on the dashboard guiding new users through setup steps. Dismissal is stored in localStorage per profile (`konex-onboarding-dismissed-{profileId}`). Shows completion progress bar and individual step status with links to relevant pages.
- **Dark/Light Mode Toggle**: A theme toggle button in the dashboard sidebar switches between dark and light mode. Preference stored in localStorage (`konex-dashboard-theme`). The main content area uses `data-theme="light"` CSS attribute scoping so only the dashboard content changes; the sidebar always stays dark. Light mode CSS variables defined in `[data-theme="light"]` selector in `index.css`. Theme state managed via `client/src/hooks/use-theme.tsx` (`ThemeProvider` + `useTheme`).

### Email Notifications
- **Refund Confirmation**: `sendRefundEmail()` in `server/email.ts` sends a customer confirmation email when a PayPal refund is processed (triggered by `PAYMENT.CAPTURE.REFUNDED` webhook event). Includes refund amount, product name, and 3–5 business day disclaimer.
- **Shipped Notification**: Already implemented — sends customer email when admin marks order as shipped via the admin orders page.

## External Dependencies

- **Database**: PostgreSQL (via `DATABASE_URL`).
- **Cloud Storage**: Google Cloud Storage (via Replit Object Storage integration) for profile photo uploads.
- **Authentication**: Session-based with cookies, `SESSION_SECRET` environment variable.
- **UI Libraries**: Radix UI, Uppy (for file uploads), Recharts (for analytics), Lucide React (for icons).
- **Build & Development**: Vite (frontend), esbuild (server), TSX (TypeScript execution).
- **Email Notifications**: SendGrid (via Replit connector) for password resets and lead notifications. Implements a fire-and-forget pattern for email sending.