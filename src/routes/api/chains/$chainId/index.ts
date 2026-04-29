import { createFileRoute } from "@tanstack/react-router";
import { getChainById, getVoteBySession } from "#/server/chains";
import { initializeDatabase } from "#/db";

initializeDatabase();

export const Route = createFileRoute("/api/chains/$chainId/")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        try {
          const { chainId } = params as { chainId: string };
          const result = await getChainById(chainId);

          if (!result) {
            return Response.json({ error: "讨论串不存在" }, { status: 404 });
          }

          const sessionId = request.headers.get("x-session-id");
          let hasVoted = false;
          let userVote: string | null = null;
          let userReason: string | null = null;

          if (sessionId) {
            const existingVote = await getVoteBySession(result.chain.id, sessionId);
            if (existingVote) {
              hasVoted = true;
              userVote = existingVote.vote;
              userReason = existingVote.reason;
            }
          }

          const voteOptions = result.chain.vote_options ? JSON.parse(result.chain.vote_options) : ["通过", "不通过"];
          const reasonRequired = result.chain.reason_required === "true";
          const allowChangeVote = result.chain.allow_change_vote !== "false";

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
              voteOptions,
              reasonRequired,
              allowChangeVote,
            },
            participantCount: result.participantCount,
            voteStats: result.voteStats,
            isExpired: result.isExpired,
            hasVoted,
            userVote,
            userReason,
          });
        } catch (err) {
          console.error("[API] getChain error:", err);
          return Response.json({ error: "获取失败" }, { status: 500 });
        }
      },
    },
  },
});