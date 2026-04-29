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
    <main className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="card mb-6 w-full max-w-96 bg-base-100 shadow-sm card-sm lg:max-w-196">
        <div className="card-body flex-row">
          <h2 className="card-title w-24 shrink-0">显示名称</h2>
          <div className="flex flex-1 items-center gap-2">
            <UserIcon className="h-4 w-4 text-base-content/60" />
            {isEditingName ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  className="input input-sm flex-1"
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
            ) : (
              <>
                <span className="text-base-content/80">{savedDisplayName || "（匿名）"}</span>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setIsEditingName(true);
                    setDisplayName(savedDisplayName || "");
                  }}
                >
                  <EditIcon className="h-4 w-4" />
                  修改
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <div className="card h-full w-96 bg-base-100 shadow-sm card-md">
          <div className="card-body flex h-full flex-col">
            <h2 className="card-title">创建新讨论</h2>
            <p>发起新讨论，并与朋友们分享</p>

            <div className="mt-auto card-actions justify-end">
              <button className="btn btn-primary" onClick={() => navigate({ to: "/chains/new" })}>
                Go!
              </button>
            </div>
          </div>
        </div>

        <div className="card h-full w-96 bg-base-100 shadow-sm card-md">
          <div className="card-body flex h-full flex-col">
            <h2 className="card-title">加入讨论</h2>
            <p>已有讨论串？在下方输入编号</p>
            {chainInputError && <p className="text-error">{chainInputError}</p>}
            <div className="flex w-full flex-row gap-3">
              <input
                className={`input w-full ${chainInputError ? "input-error" : ""}`}
                type="text"
                placeholder={isLoading ? "正在加入..." : `输入讨论串编号，例如 ${CHAINID_SAMPLE}`}
                onChange={(e) => {
                  setChainId(formatChainId(e.target.value));
                  setChainInputError("");
                }}
                value={chainId}
                disabled={isLoading}
              />

              <button
                id="pastedBtn"
                className={`btn btn-ghost ${pasted ? "btn-success" : "btn-secondary"}`}
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
                {pasted ? <CheckIcon /> : <ClipboardPasteIcon />}
              </button>
            </div>

            <div className="mt-auto card-actions justify-end">
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
