import { createFileRoute } from "@tanstack/react-router";
import { getChainByShareKey, joinChain } from "#/server/chains";

export const Route = createFileRoute("/api/chains/$shareKey/")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const result = await getChainByShareKey((params as any).shareKey);

          if (!result) {
            return Response.json({ error: "讨论串不存在" }, { status: 404 });
          }

          return Response.json({
            chain: {
              id: result.chain.id,
              shareKey: result.chain.share_key,
              title: result.chain.title,
              description: result.chain.description,
              attachments: result.chain.attachments ? JSON.parse(result.chain.attachments) : null,
              status: result.chain.status,
              expiresAt: result.chain.expires_at,
              createdAt: result.chain.created_at,
            },
            participantCount: result.participantCount,
            voteStats: result.voteStats,
            isExpired: result.isExpired,
          });
        } catch (err) {
          console.error("[API] getChain error:", err);
          return Response.json({ error: "获取失败" }, { status: 500 });
        }
      },
      POST: async ({ params, request }) => {
        try {
          const body = await request.json();
          const { displayName } = body as { displayName?: string };

          const chainResult = await getChainByShareKey((params as any).shareKey);
          if (!chainResult) {
            return Response.json({ error: "讨论串不存在" }, { status: 404 });
          }

          if (chainResult.isExpired && chainResult.chain.status === "active") {
            return Response.json({ error: "投票已截止" }, { status: 400 });
          }

          const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
          const sessionId = request.headers.get("x-session-id") ?? crypto.randomUUID();

          const result = await joinChain(chainResult.chain.id, displayName, ipAddress ?? "", sessionId);

          return Response.json(
            {
              participant: {
                id: result.participant.id,
                displayName: result.participant.display_name,
              },
              sessionId,
              hasVoted: result.hasVoted,
            },
            {
              headers: {
                "Set-Cookie": `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax`,
              },
            },
          );
        } catch (err) {
          console.error("[API] joinChain error:", err);
          return Response.json({ error: "加入失败" }, { status: 500 });
        }
      },
    },
  },
});
