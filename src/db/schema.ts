import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const chains = sqliteTable("chains", {
  id: text("id").primaryKey(),
  share_key: text("share_key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  attachments: text("attachments"),
  creator_ip: text("creator_ip"),
  status: text("status").notNull().default("active"),
  expires_at: text("expires_at"),
  created_at: text("created_at").notNull(),
  closed_at: text("closed_at"),
});

export const participants = sqliteTable("participants", {
  id: text("id").primaryKey(),
  chain_id: text("chain_id")
    .notNull()
    .references(() => chains.id, { onDelete: "cascade" }),
  display_name: text("display_name"),
  ip_address: text("ip_address"),
  session_id: text("session_id"),
  joined_at: text("joined_at").notNull(),
});

export const votes = sqliteTable("votes", {
  id: text("id").primaryKey(),
  chain_id: text("chain_id")
    .notNull()
    .references(() => chains.id, { onDelete: "cascade" }),
  participant_id: text("participant_id").references(() => participants.id, {
    onDelete: "set null",
  }),
  vote: text("vote").notNull(),
  reason: text("reason"),
  ip_address: text("ip_address"),
  session_id: text("session_id"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export type ChainRow = typeof chains.$inferSelect;
export type ParticipantRow = typeof participants.$inferSelect;
export type VoteRow = typeof votes.$inferSelect;

export interface CreateChainInput {
  title: string;
  description?: string;
  attachments?: string[];
  expiresAt?: string;
}

export interface CastVoteInput {
  chain_id: string;
  vote: "approve" | "reject";
  reason?: string;
  ip_address: string;
  session_id: string;
}

export interface VoteStats {
  approves: number;
  rejects: number;
  total: number;
}
