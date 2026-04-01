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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("请输入讨论串标题");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await createChain({
        title: title.trim(),
        description: description.trim() || undefined,
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
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 card-md shadow-sm">
        <div className="card-body">
          <button className="btn btn-ghost btn-sm -ml-2 mb-2 w-fit" onClick={() => navigate({ to: "/" })}>
            <ArrowLeftIcon className="h-4 w-4" />
            返回
          </button>

          <h2 className="card-title">创建新讨论串</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">标题 *</span>
              </label>
              <input
                type="text"
                className={`input ${error && !title.trim() ? "input-error" : ""}`}
                placeholder="输入讨论串标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                maxLength={200}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">描述（可选）</span>
              </label>
              <textarea
                className="textarea h-24"
                placeholder="简要描述这个讨论串..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div className="card-actions justify-end mt-2">
              <button type="button" className="btn btn-ghost" onClick={() => navigate({ to: "/" })} disabled={isLoading}>
                取消
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? <span className="loading loading-spinner loading-sm" /> : "创建"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
