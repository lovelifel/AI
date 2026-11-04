import "server-only";

import type { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/server/session";

type User = typeof auth.$Infer.Session.user;

type Handler<Context> = (
  request: Request,
  user: User,
  context: Context,
) => Response | Promise<Response>;

export function withAuth<Context = unknown>(fn: Handler<Context>) {
  return async function (
    request: Request,
    context: Context,
  ): Promise<Response> {
    try {
      const user = await getCurrentUser();

      if (!user) {
        return Response.json({ error: "请先登录" }, { status: 401 });
      }

      return await fn(request, user, context);
    } catch (error) {
      console.error("接口处理失败", error);

      return Response.json(
        { error: "请求处理失败，请稍后重试" },
        { status: 500 },
      );
    }
  };
}
