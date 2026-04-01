import { generateChainId, validChainId } from "#/constants/chain";

const API_BASE = "/api/chains";

export interface ChainData {
  id: string;
  shareKey: string;
  title: string;
  description: string | null;
  attachments: string[] | null;
  status: "active" | "closed";
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateChainResponse {
  chain: ChainData;
  message: string;
}

export interface GetChainResponse {
  chain: ChainData;
  participantCount: number;
  voteStats: {
    approves: number;
    rejects: number;
    total: number;
  };
  isExpired: boolean;
}

export interface JoinChainResponse {
  participant: {
    id: string;
    displayName: string | null;
  };
  sessionId: string;
  hasVoted: boolean;
}

export interface VoteResponse {
  vote: {
    id: string;
    vote: "approve" | "reject";
    reason: string | null;
    createdAt: string;
  };
  message: string;
}

export interface VoteStatsResponse {
  stats: {
    approves: number;
    rejects: number;
    total: number;
  };
  status: "active" | "closed";
  isExpired: boolean;
}

export interface ApiError {
  error: string;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = document.cookie
    .split("; ")
    .find((row) => row.startsWith("session_id="))
    ?.split("=")[1];
  if (!sessionId) {
    sessionId = generateChainId();
    document.cookie = `session_id=${sessionId}; path=/; max-age=31536000`;
  }
  return sessionId;
}

export async function createChain(data: { title: string; description?: string; attachments?: string[]; expiresAt?: string }): Promise<CreateChainResponse> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err: ApiError = await res.json();
    throw new Error(err.error || "创建失败");
  }

  return res.json();
}

export async function getChain(chainId: string): Promise<GetChainResponse> {
  if (!validChainId(chainId)) {
    throw new Error("无效的讨论串编号");
  }

  const res = await fetch(`${API_BASE}/${chainId}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("讨论串不存在");
    }
    const err: ApiError = await res.json();
    throw new Error(err.error || "获取失败");
  }

  return res.json();
}

export async function joinChain(chainId: string, displayName?: string): Promise<JoinChainResponse> {
  const sessionId = getSessionId();

  const res = await fetch(`${API_BASE}/${chainId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-session-id": sessionId,
    },
    body: JSON.stringify({ displayName }),
  });

  if (!res.ok) {
    const err: ApiError = await res.json();
    throw new Error(err.error || "加入失败");
  }

  return res.json();
}

export async function castVote(chainId: string, vote: "approve" | "reject", reason?: string): Promise<VoteResponse> {
  const sessionId = getSessionId();

  const res = await fetch(`${API_BASE}/${chainId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-session-id": sessionId,
    },
    body: JSON.stringify({ vote, reason }),
  });

  if (!res.ok) {
    const err: ApiError = await res.json();
    throw new Error(err.error || "投票失败");
  }

  return res.json();
}

export async function getVoteStats(chainId: string): Promise<VoteStatsResponse> {
  if (!validChainId(chainId)) {
    throw new Error("无效的讨论串编号");
  }

  const res = await fetch(`${API_BASE}/${chainId}/results`);

  if (!res.ok) {
    const err: ApiError = await res.json();
    throw new Error(err.error || "获取结果失败");
  }

  return res.json();
}
