import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

const SUPABASE_DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:13971672%40Meet@db.izqvdjevpavzexgtbvis.supabase.co:5432/postgres";

export const pgPool = new Pool({
  connectionString: SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const supabaseServer = createClient(
  process.env.SUPABASE_URL || "https://izqvdjevpavzexgtbvis.supabase.co",
  process.env.SUPABASE_ANON_KEY || "sb_publishable_hbyYesNYuae32oF7gA1zjw_GUMLaJeD",
  {
    auth: {
      persistSession: false,
    },
  }
);

export async function queryPg<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pgPool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function testPgConnection(): Promise<boolean> {
  try {
    const rows = await queryPg("SELECT 1 as connected, now() as timestamp;");
    console.log("[Supabase Postgres] Successfully connected to:", rows[0]);
    return true;
  } catch (error) {
    console.error("[Supabase Postgres] Connection error:", error);
    return false;
  }
}
