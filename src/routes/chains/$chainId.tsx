import { getChain, castVote, getVoteStats } from "#/server/client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, CheckIcon, ClipboardIcon, EditIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/chains/$chainId")({
  component: RouteComponent,
});

/**
 * 讨论串详情页面
 * 显示讨论串信息、投票结果，并提供投票功能
 */
function RouteComponent() {
  const navigate = useNavigate();
  const { chainId } = Route.useParams();

  // 讨论串数据
  const [chainData, setChainData] = useState<Awaited<ReturnType<typeof getChain>> | null>(null);
  // 投票统计数据
  const [statsData, setStatsData] = useState<Awaited<ReturnType<typeof getVoteStats>> | null>(null);
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  // 全局错误（如加载失败）
  const [error, setError] = useState<string>("");

  // 当前用户投票相关状态
  const [currentVote, setCurrentVote] = useState<number | null>(null); // 当前用户的投票选项索引
  const [savedReason, setSavedReason] = useState(""); // 保存的理由（用于取消时恢复）
  const [reason, setReason] = useState(""); // 当前输入的理由
  const [reasonError, setReasonError] = useState(false); // 理由填写错误
  const [voteError, setVoteError] = useState<string | null>(null); // 投票提交错误
  const [isVoting, setIsVoting] = useState(false); // 投票中状态
  const [isEditing, setIsEditing] = useState(false); // 是否在改票模式

  // 复制功能状态
  const [copied, setCopied] = useState(false);

  // 页面加载时获取数据
  useEffect(() => {
    loadChainData();
  }, [chainId]);

  // 加载讨论串数据和投票统计
  const loadChainData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [chain, stats] = await Promise.all([getChain(chainId), getVoteStats(chainId)]);
      setChainData(chain);
      setStatsData(stats);

      // 如果已投票，恢复投票状态
      if (chain.hasVoted && chain.userVote !== null) {
        const voteIndex = chain.userVote === "option_0" ? 0 : 1;
        setCurrentVote(voteIndex);
        setSavedReason(chain.userReason || "");
        setReason(chain.userReason || "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 提交投票
  const handleVote = async (voteIndex: number) => {
    setReasonError(false);

    // 检查是否需要填写理由
    if (chain.reasonRequired && !reason.trim()) {
      setReasonError(true);
      return;
    }

    setIsVoting(true);

    try {
      await castVote(chainId, voteIndex, reason || undefined);
      setCurrentVote(voteIndex);
      setSavedReason(reason); // 保存理由
      setIsEditing(false);
      await loadChainData();
    } catch (err) {
      console.error("[handleVote] Error:", err);
      setVoteError(err instanceof Error ? err.message : "投票失败");
    } finally {
      setIsVoting(false);
    }
  };

  // 复制分享码到剪贴板
  const handleCopyShareKey = async () => {
    if (!chainData) return;

    try {
      await navigator.clipboard.writeText(chainData.chain.shareKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("[Copy]", err);
    }
  };

  // 加载中显示
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="loading loading-lg loading-spinner" />
      </main>
    );
  }

  // 错误或数据不存在时显示错误页面
  if (error || !chainData) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="card bg-base-100 shadow-sm card-md">
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
  const voteOptions = chain.voteOptions || ["通过", "不通过"];
  // 检查讨论串是否已截止
  const isExpired = chainData.isExpired || chain.status === "closed";
  // 用户是否已投票
  const hasVoted = currentVote !== null;

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto max-w-2xl">
        {/* 返回按钮 */}
        <button className="btn mb-4 -ml-2 btn-ghost btn-sm" onClick={() => navigate({ to: "/" })}>
          <ArrowLeftIcon className="h-4 w-4" />
          返回
        </button>

        {/* 讨论串信息卡片 */}
        <div className="card mb-4 bg-base-100 shadow-sm card-md">
          <div className="card-body">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="card-title">{chain.title}</h2>
                <p className="flex items-center gap-2 text-sm text-base-content/60">
                  分享码: <span className="font-mono font-bold">{chain.shareKey}</span>
                  <button className={`btn btn-ghost btn-xs ${copied ? "text-success btn-success" : ""}`} onClick={handleCopyShareKey}>
                    {copied ? <CheckIcon className="h-3 w-3" /> : <ClipboardIcon className="h-3 w-3" />}
                  </button>
                </p>
              </div>
              {isExpired && <div className="badge badge-error">已截止</div>}
            </div>

            {chain.description && <p className="mt-2 text-base-content/80">{chain.description}</p>}

            <div className="divider" />

            {/* 参与者数量和投票统计 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-base-content/60">{chainData.participantCount} 位参与者</span>
              {statsData && (
                <div className="flex gap-4">
                  <span className="text-success">
                    {statsData.stats.approves} {voteOptions[0]}
                  </span>
                  <span className="text-error">
                    {statsData.stats.rejects} {voteOptions[1]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 投票结果图表 */}
        {statsData && statsData.stats.total > 0 && (
          <div className="card mb-4 bg-base-100 shadow-sm card-md">
            <div className="card-body">
              <h3 className="mb-3 font-semibold">投票结果</h3>
              <div className="h-4 w-full rounded-full bg-base-300">
                <div
                  className="h-4 rounded-full bg-success transition-all duration-300"
                  style={{
                    width: `${(statsData.stats.approves / statsData.stats.total) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-success">
                  {voteOptions[0]} {((statsData.stats.approves / statsData.stats.total) * 100).toFixed(0)}%
                </span>
                <span className="text-error">
                  {voteOptions[1]} {((statsData.stats.rejects / statsData.stats.total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 投票区域 */}
        {!isExpired && (
          <div className="card bg-base-100 shadow-sm card-md">
            <div className="card-body">
              <h3 className="mb-4 font-semibold">参与投票</h3>

              {/* 显示参与者名称 */}
              <div className="flex flex-row">
                <label className="label">参与者：</label>
                <p>{localStorage.getItem("quickleap_username") || "匿名"}</p>
              </div>

              {/* 已投票且不在改票模式时显示投票结果 */}
              {hasVoted && !isEditing && (
                <div className="mb-4 flex flex-col">
                  <div className="flex flex-row">
                    <label className="label">你的投票：</label>
                    <p className={`font-semibold ${currentVote === 0 ? "text-success" : "text-error"}`}>
                      {currentVote === 0 ? voteOptions[0] : voteOptions[1]}
                    </p>
                  </div>
                  {reason && (
                    <div className="flex flex-row">
                      <label className="label">投票理由：</label>
                      {reason ?? "无"}
                    </div>
                  )}
                </div>
              )}

              {/* 改票按钮 */}
              {hasVoted && !isEditing && chain.allowChangeVote && (
                <div className="text-center">
                  <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)}>
                    <EditIcon className="h-4 w-4" />
                    改票
                  </button>
                </div>
              )}

              {/* 投票表单：未投票或正在改票时显示 */}
              {(!hasVoted || isEditing) && (
                <>
                  {/* 理由输入区域 */}
                  <div className="form-control mb-4 flex flex-col">
                    <div className="flex justify-between">
                      <label className="label mb-2">
                        <span className="label-text">理由{chain.reasonRequired && "（必填）"}</span>
                      </label>
                      {reasonError && <span className="text-sm text-error">请填写投票理由</span>}
                    </div>
                    <textarea
                      className={`textarea max-h-20 w-full ${reasonError ? "textarea-error" : ""}`}
                      placeholder={`${chain.reasonRequired ? "请填写投票理由" : "说明你的理由..."}`}
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        if (reasonError) setReasonError(false);
                      }}
                      maxLength={500}
                    />
                    {voteError && <span className="text-sm text-error">{voteError}</span>}
                  </div>

                  {/* 投票按钮 */}
                  <div className="flex gap-4">
                    <button className="btn flex-1 btn-success" onClick={() => handleVote(0)} disabled={isVoting}>
                      {isVoting ? (
                        <span className="loading loading-sm loading-spinner" />
                      ) : (
                        <>
                          <CheckIcon className="h-5 w-5" />
                          {voteOptions[0]}
                        </>
                      )}
                    </button>
                    <button className="btn flex-1 btn-error" onClick={() => handleVote(1)} disabled={isVoting}>
                      {isVoting ? (
                        <span className="loading loading-sm loading-spinner" />
                      ) : (
                        <>
                          <XIcon className="h-5 w-5" />
                          {voteOptions[1]}
                        </>
                      )}
                    </button>
                  </div>

                  {/* 取消改票按钮 */}
                  {isEditing && chain.allowChangeVote && (
                    <button
                      className="btn mt-2 w-full btn-ghost btn-sm"
                      onClick={() => {
                        setIsEditing(false);
                        setReason(savedReason); // 恢复之前保存的理由
                      }}
                    >
                      取消
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
