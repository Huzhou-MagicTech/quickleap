import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("quickjump.db");
export const db = drizzle(sqlite, { schema });

export async function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chains (
      id TEXT PRIMARY KEY,
      share_key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      attachments TEXT,
      creator_ip TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      expires_at TEXT,
      created_at TEXT NOT NULL,
      closed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      chain_id TEXT NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
      display_name TEXT,
      ip_address TEXT,
      session_id TEXT,
      joined_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      chain_id TEXT NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
      participant_id TEXT REFERENCES participants(id) ON DELETE SET NULL,
      vote TEXT NOT NULL,
      reason TEXT,
      ip_address TEXT,
      session_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_participants_chain_id ON participants(chain_id);
    CREATE INDEX IF NOT EXISTS idx_votes_chain_id ON votes(chain_id);
    CREATE INDEX IF NOT EXISTS idx_votes_session_id ON votes(session_id);
  `);

  console.log("[DB] Database initialized");
}

export { schema };
export type Database = typeof sqlite;
