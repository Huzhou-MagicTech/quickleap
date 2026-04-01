import { createFileRoute } from "@tanstack/react-router";
import { getChainByShareKey, getVoteStats } from "#/server/chains";

export const Route = createFileRoute("/api/chains/$shareKey/results/")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const chainResult = await getChainByShareKey((params as any).shareKey);

          if (!chainResult) {
            return Response.json({ error: "讨论串不存在" }, { status: 404 });
          }

          const result = await getVoteStats(chainResult.chain.id);

          return Response.json({
            stats: result.stats,
            status: result.status,
            isExpired: result.isExpired,
          });
        } catch (err) {
          console.error("[API] getVoteStats error:", err);
          return Response.json({ error: "获取失败" }, { status: 500 });
        }
      },
    },
  },
});
