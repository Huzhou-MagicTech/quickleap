import { createFileRoute } from "@tanstack/react-router";
import { getChainByShareKey, joinChain, castVote } from "#/server/chains";

export const Route = createFileRoute("/api/chains/$shareKey/vote/")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        try {
          const body = await request.json();
          const { voteIndex, reason } = body as { voteIndex: number; reason?: string };

          if (voteIndex !== 0 && voteIndex !== 1) {
            return Response.json({ error: "无效的投票选项" }, { status: 400 });
          }

          const chainResult = await getChainByShareKey((params as any).shareKey);
          if (!chainResult) {
            return Response.json({ error: "讨论串不存在" }, { status: 404 });
          }

          if (chainResult.isExpired || chainResult.chain.status === "closed") {
            return Response.json({ error: "投票已截止" }, { status: 400 });
          }

          // 检查 reason_required 设置
          if (chainResult.chain.reason_required === "true" && (!reason || reason.trim().length === 0)) {
            return Response.json({ error: "请填写投票理由" }, { status: 400 });
          }

          const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
          // 使用客户端传入的 sessionId，如果没有则生成新的
          const clientSessionId = request.headers.get("x-session-id");
          const sessionId = clientSessionId || crypto.randomUUID();

          // 每次投票都加入讨论串（为当前讨论串创建新参与者）
          try {
            await joinChain(chainResult.chain.id, undefined, ipAddress ?? "", sessionId);
          } catch (e) {
            console.error("[API castVote] joinChain error:", e);
          }

          const result = await castVote({
            chain_id: chainResult.chain.id,
            vote: voteIndex === 0 ? "option_0" : "option_1",
            reason,
            ip_address: ipAddress ?? "",
            session_id: sessionId,
          });


          return Response.json(
            {
              vote: {
                id: result.vote.id,
                vote: result.vote.vote,
                reason: result.vote.reason,
                createdAt: result.vote.created_at,
              },
              sessionId: sessionId,
              message: result.isNew ? "投票成功" : "投票已更新",
            },
            {
              headers: {
                "Set-Cookie": `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax`,
              },
            },
          );
        } catch (err) {
          console.error("[API] castVote error:", err);
          return Response.json({ error: "投票失败" }, { status: 500 });
        }
      },
    },
  },
});
