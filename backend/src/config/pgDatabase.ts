import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

const SUPABASE_DB_URL = process.env.DATABASE_URL || "";

export const pgPool = SUPABASE_DB_URL
  ? new Pool({
      connectionString: SUPABASE_DB_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : null;

export const supabaseServer =
  process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      })
    : null;

export async function queryPg<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (!pgPool) return [];
  const client = await pgPool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function testPgConnection(): Promise<boolean> {
  if (!pgPool) return false;
  try {
    const rows = await queryPg("SELECT 1 as connected, now() as timestamp;");
    console.log("[Supabase Postgres] Successfully connected to:", rows[0]);
    return true;
  } catch (error) {
    console.error("[Supabase Postgres] Connection error:", error);
    return false;
  }
}
