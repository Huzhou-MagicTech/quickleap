import { generateChainId, validChainId } from "#/constants/chain";

const API_BASE = "/api/chains";
const SESSION_KEY = "quickleap_sessions";
const USERNAME_KEY = "quickleap_username";

export interface ChainData {
  id: string;
  shareKey: string;
  title: string;
  description: string | null;
  attachments: string[] | null;
  status: "active" | "closed";
  expiresAt: string | null;
  createdAt: string;
  voteOptions: [string, string];
  reasonRequired: boolean;
  allowChangeVote: boolean;
}

function getStoredSessions(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setStoredSessions(sessions: Record<string, string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
}

export function getSessionId(chainId: string): string {
  if (typeof window === "undefined") return "";
  const sessions = getStoredSessions();
  let sessionId = sessions[chainId];
  if (!sessionId) {
    sessionId = generateChainId();
    sessions[chainId] = sessionId;
    setStoredSessions(sessions);
  }
  return sessionId;
}

export function setSessionId(chainId: string, id: string): void {
  if (typeof window === "undefined") return;
  const sessions = getStoredSessions();
  sessions[chainId] = id;
  setStoredSessions(sessions);
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
  hasVoted: boolean;
  userVote: string | null;
  userReason: string | null;
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
    vote: string;
    reason: string | null;
    createdAt: string;
  };
  sessionId?: string;
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

export function getSavedUsername(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USERNAME_KEY) || "";
}

export function saveUsername(name: string): void {
  if (typeof window === "undefined") return;
  if (name.trim()) {
    localStorage.setItem(USERNAME_KEY, name.trim());
  } else {
    localStorage.removeItem(USERNAME_KEY);
  }
}

export async function createChain(data: {
  title: string;
  description?: string;
  attachments?: string[];
  expiresAt?: string;
  voteOptions?: [string, string];
  reasonRequired?: boolean;
  allowChangeVote?: boolean;
}): Promise<CreateChainResponse> {
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

  const sessionId = getSessionId(chainId);

  const res = await fetch(`${API_BASE}/${chainId}`, {
    headers: {
      "x-session-id": sessionId,
    },
  });

  if (!res.ok) {
    console.error("[getChain] Failed:", res.status, res.statusText);
    if (res.status === 404) {
      throw new Error("讨论串不存在");
    }
    try {
      const err: ApiError = await res.json();
      throw new Error(err.error || "获取失败");
    } catch {
      throw new Error(`获取失败 (${res.status})`);
    }
  }

  return res.json();
}

export async function joinChain(chainId: string, displayName?: string): Promise<JoinChainResponse> {
  const sessionId = getSessionId(chainId);

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

export async function castVote(chainId: string, voteIndex: number, reason?: string): Promise<VoteResponse> {
  const sessionId = getSessionId(chainId);

  const res = await fetch(`${API_BASE}/${chainId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-session-id": sessionId,
    },
    body: JSON.stringify({ voteIndex, reason }),
  });

  if (!res.ok) {
    const err: ApiError = await res.json();
    throw new Error(err.error || "投票失败");
  }

  const setCookie = res.headers.get("Set-Cookie");
  if (setCookie) {
    const match = setCookie.match(/session_id=([^;]+)/);
    if (match) {
      setSessionId(chainId, match[1]);
    }
  }

  const data: VoteResponse = await res.json();
  if (data.sessionId) {
    setSessionId(chainId, data.sessionId);
  }

  return data;
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
