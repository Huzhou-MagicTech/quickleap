import { CHAINID_SAMPLE, formatChainId, validChainId } from "#/constants/chain";
import { getChain } from "#/server/client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckIcon, ClipboardPasteIcon, EditIcon, UserIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const navigate = useNavigate();

  const [chainId, setChainId] = useState<string>("");
  const [chainInputError, setChainInputError] = useState<string>("");
  const [pasted, setPasted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [displayName, setDisplayName] = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("quickleap_username");
    if (saved) {
      setDisplayName(saved);
      setSavedDisplayName(saved);
    }
  }, []);

  const handleUpdateName = () => {
    if (displayName.trim()) {
      setSavedDisplayName(displayName.trim());
      localStorage.setItem("quickleap_username", displayName.trim());
    }
    setIsEditingName(false);
  };

  const handleJoinChain = async () => {
    if (!chainId) {
      setChainInputError("请输入讨论串编号");
      return;
    }

    if (!validChainId(chainId)) {
      setChainInputError("讨论串编号格式错误");
      return;
    }

    setIsLoading(true);
    setChainInputError("");

    try {
      const result = await getChain(chainId);
      navigate({
        to: "/chains/$chainId",
        params: { chainId: result.chain.shareKey },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "加入失败";
      setChainInputError(msg || "加入失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-16">
      {/* 显示名称卡片 - 紧凑顶部元素 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm">
          <UserIcon className="h-4 w-4 text-[var(--sea-ink-soft)]" />
          <span className="text-[var(--sea-ink)]">{savedDisplayName || "（匿名）"}</span>
          <button
            className="ml-1 rounded-full p-1 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
            onClick={() => {
              setIsEditingName(true);
              setDisplayName(savedDisplayName || "");
            }}
          >
            <EditIcon className="h-3 w-3" />
          </button>
        </div>

        {/* 内联编辑模式 */}
        {isEditingName && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="input input-sm w-48"
              placeholder="输入你的名称"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              autoFocus
            />
            <button className="btn btn-sm btn-success" onClick={handleUpdateName}>
              <CheckIcon className="h-4 w-4" />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingName(false)}>
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 主操作区域 */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="card bg-base-100 shadow-sm card-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">创建新讨论</h2>
            <p className="mt-1 text-sm text-base-content/70">发起新讨论，并与朋友们分享</p>
            <div className="mt-4 card-actions justify-end">
              <button className="btn btn-primary" onClick={() => navigate({ to: "/chains/new" })}>
                开始
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm card-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">加入讨论</h2>
            <p className="mt-1 text-sm text-base-content/70">已有讨论串？在下方输入编号</p>
            {chainInputError && <p className="mt-2 text-sm text-error">{chainInputError}</p>}
            <div className="mt-3 flex gap-3">
              <input
                className={`input w-full ${chainInputError ? "input-error" : ""}`}
                type="text"
                placeholder={isLoading ? "正在加入..." : `输入编号，例如 ${CHAINID_SAMPLE}`}
                onChange={(e) => {
                  setChainId(formatChainId(e.target.value));
                  setChainInputError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading && chainId) {
                    handleJoinChain();
                  }
                }}
                value={chainId}
                disabled={isLoading}
              />

              <button
                id="pastedBtn"
                className={`btn btn-sm ${pasted ? "btn-success" : "btn-ghost"}`}
                disabled={isLoading}
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();

                    if (!text) return;

                    setChainId(formatChainId(text));
                    setChainInputError("");
                    setPasted(true);

                    setTimeout(() => {
                      setPasted(false);
                    }, 3000);
                  } catch (err) {
                    console.error("[pastedBtn]", "粘贴失败：", err);
                  }
                }}
              >
                {pasted ? <CheckIcon className="h-4 w-4" /> : <ClipboardPasteIcon className="h-4 w-4" />}
              </button>
            </div>

            <div className="mt-3 card-actions justify-end">
              <button className="btn btn-primary" disabled={isLoading} onClick={handleJoinChain}>
                {isLoading ? <span className="loading loading-sm loading-spinner" /> : "加入"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
