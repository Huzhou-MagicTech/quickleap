import { createFileRoute } from "@tanstack/react-router";
import { getChainByShareKey, castVote } from "#/server/chains";

export const Route = createFileRoute("/api/chains/$shareKey/vote/")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        try {
          const body = await request.json();
          const { vote, reason } = body as { vote: "approve" | "reject"; reason?: string };

          if (!vote || !["approve", "reject"].includes(vote)) {
            return Response.json({ error: "无效的投票选项" }, { status: 400 });
          }

          if (vote === "reject" && (!reason || reason.trim().length === 0)) {
            return Response.json({ error: "不通过必须填写理由" }, { status: 400 });
          }

          const chainResult = await getChainByShareKey((params as any).shareKey);
          if (!chainResult) {
            return Response.json({ error: "讨论串不存在" }, { status: 404 });
          }

          if (chainResult.isExpired || chainResult.chain.status === "closed") {
            return Response.json({ error: "投票已截止" }, { status: 400 });
          }

          const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
          const sessionId = request.headers.get("x-session-id");

          if (!sessionId) {
            return Response.json({ error: "请先加入讨论串" }, { status: 401 });
          }

          const result = await castVote({
            chain_id: chainResult.chain.id,
            vote,
            reason,
            ip_address: ipAddress ?? "",
            session_id: sessionId,
          });

          return Response.json({
            vote: {
              id: result.vote.id,
              vote: result.vote.vote,
              reason: result.vote.reason,
              createdAt: result.vote.created_at,
            },
            message: result.isNew ? "投票成功" : "投票已更新",
          });
        } catch (err) {
          console.error("[API] castVote error:", err);
          return Response.json({ error: "投票失败" }, { status: 500 });
        }
      },
    },
  },
});
