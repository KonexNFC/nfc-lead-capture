import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isProduction = process.env.NODE_ENV === "production";
const dbUrl = process.env.DATABASE_URL;

// SSL config: full verification in production, relaxed in development for
// remote databases (e.g. Neon). No SSL for localhost.
const isLocalDb = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");

const poolConfig: pg.PoolConfig = { connectionString: dbUrl };
if (isProduction) {
  poolConfig.ssl = { rejectUnauthorized: true };
} else if (!isLocalDb) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });
