/**
 * One-time script to push the KONEX schema to a new Neon database.
 *
 * Usage:
 *   1. Add your Neon connection string as NEON_DATABASE_URL in Replit Secrets
 *   2. Run:  npx tsx scripts/setup-neon.ts
 */

import { execSync } from "child_process";

const neonUrl = process.env.NEON_DATABASE_URL;

if (!neonUrl) {
  console.error("\n❌  NEON_DATABASE_URL is not set.");
  console.error("    Add it as a secret in Replit, then re-run this script.\n");
  process.exit(1);
}

if (!neonUrl.startsWith("postgresql://") && !neonUrl.startsWith("postgres://")) {
  console.error("\n❌  NEON_DATABASE_URL does not look like a valid PostgreSQL URL.");
  console.error("    It should start with postgresql:// or postgres://\n");
  process.exit(1);
}

console.log("\n🔗  Connecting to Neon database...");
console.log("    Host:", new URL(neonUrl).hostname);

try {
  execSync(`DATABASE_URL="${neonUrl}" npx drizzle-kit push --force`, {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: neonUrl },
  });

  console.log("\n✅  All tables created successfully on Neon!\n");
  console.log("Next steps:");
  console.log("  1. In Replit Secrets, update DATABASE_URL to your Neon connection string");
  console.log("     (the same value you set as NEON_DATABASE_URL)");
  console.log("  2. Restart the dev server (Stop & Run)");
  console.log("  3. In Replit Deployments → Secrets, also update DATABASE_URL there");
  console.log("  4. Republish your deployment\n");
  console.log("Your app will then be fully independent of Replit's internal database.\n");
} catch (err) {
  console.error("\n❌  Schema push failed. Check the error above.");
  console.error("    Common causes:");
  console.error("    - Wrong connection string format");
  console.error("    - Neon project not yet created");
  console.error("    - SSL required: add ?sslmode=require to your connection string\n");
  process.exit(1);
}
