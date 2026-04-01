import { getChain, joinChain, castVote, getVoteStats } from "#/server/client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, CheckIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/chains/$chainId")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { chainId } = Route.useParams();

  const [chainData, setChainData] = useState<Awaited<ReturnType<typeof getChain>> | null>(null);
  const [statsData, setStatsData] = useState<Awaited<ReturnType<typeof getVoteStats>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [displayName, setDisplayName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [currentVote, setCurrentVote] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState("");

  useEffect(() => {
    loadChainData();
  }, [chainId]);

  const loadChainData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [chain, stats] = await Promise.all([getChain(chainId), getVoteStats(chainId)]);
      setChainData(chain);
      setStatsData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (hasJoined) return;

    try {
      const result = await joinChain(chainId, displayName || undefined);
      setHasJoined(true);
      if (result.hasVoted) {
        loadChainData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加入失败");
    }
  };

  const handleVote = async (vote: "approve" | "reject") => {
    setCurrentVote(vote);
    setVoteError("");

    if (vote === "reject" && !reason.trim()) {
      setVoteError("不通过必须填写理由");
      return;
    }

    setIsVoting(true);

    try {
      await castVote(chainId, vote, reason || undefined);
      await loadChainData();
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : "投票失败");
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </main>
    );
  }

  if (error || !chainData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="card bg-base-100 card-md shadow-sm">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-error">出错了</h2>
            <p>{error || "讨论串不存在"}</p>
            <div className="card-actions">
              <button className="btn btn-primary" onClick={() => navigate({ to: "/" })}>
                返回首页
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { chain } = chainData;
  const isExpired = chainData.isExpired || chain.status === "closed";

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <button className="btn btn-ghost btn-sm -ml-2 mb-4" onClick={() => navigate({ to: "/" })}>
          <ArrowLeftIcon className="h-4 w-4" />
          返回
        </button>

        <div className="card bg-base-100 card-md shadow-sm mb-4">
          <div className="card-body">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="card-title">{chain.title}</h2>
                <p className="text-sm text-base-content/60">
                  分享码: <span className="font-mono font-bold">{chain.shareKey}</span>
                </p>
              </div>
              {isExpired && <div className="badge badge-error">已截止</div>}
            </div>

            {chain.description && <p className="mt-2 text-base-content/80">{chain.description}</p>}

            <div className="divider" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-base-content/60">{chainData.participantCount} 位参与者</span>
              {statsData && (
                <div className="flex gap-4">
                  <span className="text-success">{statsData.stats.approves} 通过</span>
                  <span className="text-error">{statsData.stats.rejects} 不通过</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {statsData && statsData.stats.total > 0 && (
          <div className="card bg-base-100 card-md shadow-sm mb-4">
            <div className="card-body">
              <h3 className="font-semibold mb-3">投票结果</h3>
              <div className="w-full bg-base-300 rounded-full h-4">
                <div
                  className="bg-success h-4 rounded-full transition-all"
                  style={{
                    width: `${(statsData.stats.approves / statsData.stats.total) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-success">通过 {((statsData.stats.approves / statsData.stats.total) * 100).toFixed(0)}%</span>
                <span className="text-error">不通过 {((statsData.stats.rejects / statsData.stats.total) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}

        {!isExpired && (
          <div className="card bg-base-100 card-md shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold mb-4">参与投票</h3>

              {!hasJoined && (
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">显示名称（可选）</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="输入你的名称"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={50}
                  />
                </div>
              )}

              {!hasJoined && (
                <button className="btn btn-outline w-full mb-4" onClick={handleJoin}>
                  加入讨论
                </button>
              )}

              {hasJoined && (
                <>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">理由（不通过时必填）</span>
                    </label>
                    <textarea
                      className="textarea h-20"
                      placeholder="说明你的理由..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={500}
                    />
                  </div>

                  {voteError && (
                    <div className="alert alert-error mb-4">
                      <span>{voteError}</span>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      className={`btn btn-success flex-1 ${currentVote === "approve" ? "btn-outline" : ""}`}
                      onClick={() => handleVote("approve")}
                      disabled={isVoting}
                    >
                      <CheckIcon className="h-5 w-5" />
                      通过
                    </button>
                    <button
                      className={`btn btn-error flex-1 ${currentVote === "reject" ? "btn-outline" : ""}`}
                      onClick={() => handleVote("reject")}
                      disabled={isVoting}
                    >
                      <XIcon className="h-5 w-5" />
                      不通过
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
