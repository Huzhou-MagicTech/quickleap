import { db, schema } from "#/db";
import { eq, and, sql } from "drizzle-orm";
import type { CreateChainInput, CastVoteInput, VoteStats } from "#/db/schema";

const SHARE_KEY_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SEGMENT_LENGTH = 4;
const SEGMENT_COUNT = 4;

function generateShareKey(): string {
  const segments = [];
  for (let i = 0; i < SEGMENT_COUNT; i++) {
    let segment = "";
    for (let j = 0; j < SEGMENT_LENGTH; j++) {
      segment += SHARE_KEY_CHARS[Math.floor(Math.random() * SHARE_KEY_CHARS.length)];
    }
    segments.push(segment);
  }
  return segments.join("-");
}

function generateId(): string {
  return crypto.randomUUID();
}

function isChainExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export async function createChain(input: CreateChainInput, creatorIp: string | null): Promise<schema.ChainRow> {
  const id = generateId();
  let shareKey = generateShareKey();

  let existing = db.select().from(schema.chains).where(eq(schema.chains.share_key, shareKey)).get();
  while (existing) {
    shareKey = generateShareKey();
    existing = db.select().from(schema.chains).where(eq(schema.chains.share_key, shareKey)).get();
  }

  const now = new Date().toISOString();
  const voteOptions = input.voteOptions ? JSON.stringify(input.voteOptions) : '["通过","不通过"]';
  const chain = {
    id,
    share_key: shareKey,
    title: input.title,
    description: input.description ?? null,
    attachments: input.attachments ? JSON.stringify(input.attachments) : null,
    creator_ip: creatorIp ?? null,
    status: "active" as const,
    expires_at: input.expiresAt ?? null,
    created_at: now,
    closed_at: null,
    vote_options: voteOptions,
    reason_required: input.reasonRequired ? "true" : "false",
    allow_change_vote: input.allowChangeVote === false ? "false" : "true",
  };

  db.insert(schema.chains).values(chain).run();

  return chain;
}

export async function getChainById(
  chainId: string,
): Promise<{ chain: schema.ChainRow; participantCount: number; voteStats: VoteStats; isExpired: boolean } | null> {
  const chain = db.select().from(schema.chains).where(eq(schema.chains.id, chainId)).get();

  if (!chain) return null;

  const participantCount =
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.participants)
      .where(eq(schema.participants.chain_id, chain.id))
      .get()?.count ?? 0;

  const votes = db.select().from(schema.votes).where(eq(schema.votes.chain_id, chain.id)).all();

  const voteStats: VoteStats = {
    approves: votes.filter((v) => v.vote === "option_0" || v.vote === "approve").length,
    rejects: votes.filter((v) => v.vote === "option_1" || v.vote === "reject").length,
    total: votes.length,
  };

  return {
    chain,
    participantCount,
    voteStats,
    isExpired: isChainExpired(chain.expires_at),
  };
}

export async function getChainByShareKey(
  shareKey: string,
): Promise<{ chain: schema.ChainRow; participantCount: number; voteStats: VoteStats; isExpired: boolean } | null> {
  const chain = db.select().from(schema.chains).where(eq(schema.chains.share_key, shareKey.toUpperCase())).get();

  if (!chain) return null;

  const participantCount =
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.participants)
      .where(eq(schema.participants.chain_id, chain.id))
      .get()?.count ?? 0;

  const votes = db.select().from(schema.votes).where(eq(schema.votes.chain_id, chain.id)).all();

  const voteStats: VoteStats = {
    approves: votes.filter((v) => v.vote === "option_0" || v.vote === "approve").length,
    rejects: votes.filter((v) => v.vote === "option_1" || v.vote === "reject").length,
    total: votes.length,
  };

  return {
    chain,
    participantCount,
    voteStats,
    isExpired: isChainExpired(chain.expires_at),
  };
}

export async function joinChain(
  chainId: string,
  displayName: string | undefined,
  ipAddress: string,
  sessionId: string,
): Promise<{ participant: schema.ParticipantRow; hasVoted: boolean }> {
  

  const existing = db
    .select()
    .from(schema.participants)
    .where(and(eq(schema.participants.chain_id, chainId), eq(schema.participants.session_id, sessionId)))
    .get();


  if (existing) {
    const hasVoted = !!db.select().from(schema.votes).where(eq(schema.votes.session_id, sessionId)).get();

    return { participant: existing, hasVoted };
  }

  const id = generateId();
  const now = new Date().toISOString();

  const participant = {
    id,
    chain_id: chainId,
    display_name: displayName ?? null,
    ip_address: ipAddress,
    session_id: sessionId,
    joined_at: now,
  };

  db.insert(schema.participants).values(participant).run();
  

  return { participant, hasVoted: false };
}

export async function castVote(input: CastVoteInput): Promise<{ vote: schema.VoteRow; isNew: boolean }> {

  const existing = db
    .select()
    .from(schema.votes)
    .where(and(eq(schema.votes.session_id, input.session_id), eq(schema.votes.chain_id, input.chain_id)))
    .get();

  const now = new Date().toISOString();

  if (existing) {
    db.update(schema.votes)
      .set({
        vote: input.vote,
        reason: input.reason ?? null,
        ip_address: input.ip_address,
        updated_at: now,
      })
      .where(eq(schema.votes.id, existing.id))
      .run();


    return { vote: { ...existing, vote: input.vote, reason: input.reason ?? null, updated_at: now }, isNew: false };
  }

  const id = generateId();
  const participant = db
    .select()
    .from(schema.participants)
    .where(and(eq(schema.participants.chain_id, input.chain_id), eq(schema.participants.session_id, input.session_id)))
    .get();

  const vote = {
    id,
    chain_id: input.chain_id,
    participant_id: participant?.id ?? null,
    vote: input.vote,
    reason: input.reason ?? null,
    ip_address: input.ip_address,
    session_id: input.session_id,
    created_at: now,
    updated_at: now,
  };

  db.insert(schema.votes).values(vote).run();

  return { vote, isNew: true };
}

export async function getVoteStats(chainId: string): Promise<{ stats: VoteStats; status: "active" | "closed"; isExpired: boolean }> {
  const chain = db.select().from(schema.chains).where(eq(schema.chains.id, chainId)).get();

  if (!chain) {
    return { stats: { approves: 0, rejects: 0, total: 0 }, status: "closed", isExpired: true };
  }

  const votes = db.select().from(schema.votes).where(eq(schema.votes.chain_id, chainId)).all();

  return {
    stats: {
      approves: votes.filter((v) => v.vote === "option_0" || v.vote === "approve").length,
      rejects: votes.filter((v) => v.vote === "option_1").length,
      total: votes.length,
    },
    status: chain.status as "active" | "closed",
    isExpired: isChainExpired(chain.expires_at),
  };
}

export async function getParticipantBySession(chainId: string, sessionId: string): Promise<schema.ParticipantRow | null> {
  return (
    db
      .select()
      .from(schema.participants)
      .where(and(eq(schema.participants.chain_id, chainId), eq(schema.participants.session_id, sessionId)))
      .get() ?? null
  );
}

export async function getVoteBySession(chainId: string, sessionId: string): Promise<schema.VoteRow | null> {
  return (
    db
      .select()
      .from(schema.votes)
      .where(and(eq(schema.votes.chain_id, chainId), eq(schema.votes.session_id, sessionId)))
      .get() ?? null
  );
}
