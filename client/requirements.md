## Packages
qrcode.react | For generating QR codes for the digital profiles
recharts | For displaying lead analytics charts
framer-motion | For page transitions and smooth UI animations
zod | Schema validation (already in base, but ensuring)
lucide-react | Icons (already in base)

## Notes
The app relies on session-based authentication (cookies).
Public profiles are accessible via /u/:slug without auth.
Lead capture form on public profile submits to /api/public/leads.
