import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("缺少 DATABASE_URL");
}

const globalForDb = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

const pool = globalForDb.pgPool ?? new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle({ client: pool });