import { createFileRoute } from "@tanstack/react-router";
import { initializeDatabase } from "#/db";
import { createChain } from "#/server/chains";
import type { CreateChainInput } from "#/db/schema";

initializeDatabase();

export const Route = createFileRoute("/api/chains/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as CreateChainInput;

          if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
            return Response.json({ error: "标题不能为空" }, { status: 400 });
          }

          if (body.title.length > 200) {
            return Response.json({ error: "标题不能超过200个字符" }, { status: 400 });
          }

          if (body.expiresAt) {
            const date = new Date(body.expiresAt);
            if (isNaN(date.getTime()) || date < new Date()) {
              return Response.json({ error: "截止时间必须是未来时间" }, { status: 400 });
            }
          }

          if (body.voteOptions) {
            if (!Array.isArray(body.voteOptions) || body.voteOptions.length !== 2) {
              return Response.json({ error: "投票选项必须是包含两个元素的数组" }, { status: 400 });
            }
            if (!body.voteOptions[0]?.trim() || !body.voteOptions[1]?.trim()) {
              return Response.json({ error: "投票选项不能为空" }, { status: 400 });
            }
          }

          const creatorIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
          const chain = await createChain(body, creatorIp);

          const voteOptions = chain.vote_options ? JSON.parse(chain.vote_options) : ["通过", "不通过"];
          const reasonRequired = chain.reason_required === "true";
          const allowChangeVote = chain.allow_change_vote !== "false";

          return Response.json(
            {
              chain: {
                id: chain.id,
                shareKey: chain.share_key,
                title: chain.title,
                description: chain.description,
                attachments: chain.attachments ? JSON.parse(chain.attachments) : null,
                status: chain.status,
                expiresAt: chain.expires_at,
                createdAt: chain.created_at,
                voteOptions,
                reasonRequired,
                allowChangeVote,
              },
              message: "讨论串创建成功",
            },
            { status: 201 },
          );
        } catch (err) {
          console.error("[API] createChain error:", err);
          return Response.json({ error: "创建失败" }, { status: 500 });
        }
      },
    },
  },
});
