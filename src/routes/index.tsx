import { CHAINID_SAMPLE, formatChainId } from "#/constants/chain";
import { getChain } from "#/server/client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckIcon, ClipboardPasteIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const navigate = useNavigate();

  const [chainId, setChainId] = useState<string>("");
  const [chainInputError, setChainInputError] = useState<string>("");
  const [pasted, setPasted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      setChainInputError(err instanceof Error ? err.message : "加入失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <div className="card w-96 h-full bg-base-100 card-md shadow-sm">
          <div className="card-body flex flex-col h-full">
            <h2 className="card-title">创建新讨论</h2>
            <p>发起新讨论，并与朋友们分享</p>

            <div className="justify-end card-actions mt-auto">
              <button className="btn btn-primary" onClick={() => navigate({ to: "/chains/new" })}>
                Go!
              </button>
            </div>
          </div>
        </div>

        <div className="card w-96 h-full bg-base-100 card-md shadow-sm">
          <div className="card-body flex flex-col h-full">
            <h2 className="card-title">加入讨论</h2>
            <p>已有讨论串？在下方输入编号</p>
            <div className="w-full flex flex-row gap-3">
              <input
                className={`input ${chainInputError ? "input-error" : ""}`}
                type="text"
                placeholder={chainInputError ? chainInputError : `输入讨论串编号，例如 ${CHAINID_SAMPLE}`}
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

            <div className="justify-end card-actions mt-auto">
              <button className="btn btn-primary" disabled={isLoading} onClick={handleJoinChain}>
                {isLoading ? <span className="loading loading-spinner loading-sm" /> : "加入"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function validChainId(chainId: string): boolean {
  if (typeof chainId !== "string") return false;
  const regex = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
  return regex.test(chainId);
}
