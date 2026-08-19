---
name: DB & auth quirks
description: Gotchas for schema changes and API testing in this project
---
- `npm run db:push` (drizzle-kit push) can hang on an interactive create-vs-rename prompt when adding tables (it suggested renaming `session`). Safer: create new tables with idempotent `CREATE TABLE IF NOT EXISTS` SQL and mirror it in startup DDL (see `ensureUnknownCardTapsTable` pattern in server/routes.ts).
  **Why:** no migrations directory exists; prod DB (`NEON_PROD_DATABASE_URL`) also needs the DDL, and push is interactive.
- Login API expects `{"username": <email>, "password": ...}` (passport LocalStrategy default field), not `email`.
- Completion code review is strict on public endpoints: require proxy-aware `req.ip` rate limiting (trust proxy is set in prod in server/auth.ts), atomic row caps (advisory lock), and bounded admin list responses.
