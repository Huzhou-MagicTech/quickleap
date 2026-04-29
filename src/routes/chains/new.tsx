import { createChain } from "#/server/client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/chains/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [useCustomOptions, setUseCustomOptions] = useState(false);
  const [option0, setOption0] = useState("通过");
  const [option1, setOption1] = useState("不通过");
  const [reasonRequired, setReasonRequired] = useState(false);
  const [allowChangeVote, setAllowChangeVote] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    setIsLoading(true);
    setTitleError(false);

    try {
      const result = await createChain({
        title: title.trim(),
        description: description.trim() || undefined,
        voteOptions: useCustomOptions ? [option0.trim(), option1.trim()] : undefined,
        reasonRequired,
        allowChangeVote,
      });

      navigate({
        to: "/chains/$chainId",
        params: { chainId: result.chain.shareKey },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-sm card-md">
        <div className="card-body">
          <button className="btn mb-2 -ml-2 w-fit btn-ghost btn-sm" onClick={() => navigate({ to: "/" })}>
            <ArrowLeftIcon className="h-4 w-4" />
            返回
          </button>

          <h2 className="card-title">创建新讨论串</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control flex flex-col">
              <div className="flex justify-between">
                <label className="label mb-2">
                  <span className="label-text">标题（必填）</span>
                </label>
                {titleError && <span className="text-error">请填写讨论串标题</span>}
              </div>
              <input
                type="text"
                className={`input w-full ${titleError ? "input-error" : ""}`}
                placeholder="输入讨论串标题"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading && title.trim()) {
                    handleSubmit(e as any);
                  }
                }}
                disabled={isLoading}
                maxLength={200}
              />
            </div>

            <div className="form-control flex flex-col">
              <label className="label mb-2">
                <span className="label-text">描述</span>
              </label>
              <textarea
                className="textarea h-24 w-full"
                placeholder="简要描述这个讨论串..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="collapse-arrow collapse rounded-lg bg-base-200">
              <input type="checkbox" className="collapse-toggle" checked={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)} />
              <div className="collapse-title min-h-fit p-3 text-base font-medium">
                <span className="flex items-center gap-2">高级选项</span>
              </div>
              <div className="collapse-content space-y-4">
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-accent"
                      checked={useCustomOptions}
                      onChange={(e) => setUseCustomOptions(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span className="label-text">自定义投票选项</span>
                  </label>
                </div>

                {useCustomOptions && (
                  <div className="flex gap-3">
                    <div className="form-control flex-1">
                      <label className="label mb-2">
                        <span className="label-text text-success">选项 A</span>
                      </label>
                      <input
                        type="text"
                        className="input-bordered input input-sm input-success"
                        placeholder="选项 A"
                        value={option0}
                        onChange={(e) => setOption0(e.target.value)}
                        disabled={isLoading}
                        maxLength={20}
                      />
                    </div>
                    <div className="form-control flex-1">
                      <label className="label mb-2">
                        <span className="label-text text-error">选项 B</span>
                      </label>
                      <input
                        type="text"
                        className="input-bordered input input-sm input-error"
                        placeholder="选项 B"
                        value={option1}
                        onChange={(e) => setOption1(e.target.value)}
                        disabled={isLoading}
                        maxLength={20}
                      />
                    </div>
                  </div>
                )}

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-accent"
                      checked={reasonRequired}
                      onChange={(e) => setReasonRequired(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span className="label-text">理由必填</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-accent"
                      checked={allowChangeVote}
                      onChange={(e) => setAllowChangeVote(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span className="label-text">允许改票</span>
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div className="mt-2 card-actions justify-end">
              <button type="button" className="btn btn-ghost" onClick={() => navigate({ to: "/" })} disabled={isLoading}>
                取消
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? <span className="loading loading-sm loading-spinner" /> : "创建"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
