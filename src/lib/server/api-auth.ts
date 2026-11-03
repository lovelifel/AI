import "server-only";

import type { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/server/session";

type User = typeof auth.$Infer.Session.user;

type Handler = (request: Request, user: User) => Response | Promise<Response>;

export function withAuth(fn: Handler) {
  return async function (request: Request): Promise<Response> {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "请先登录" }, { status: 401 });
    }

    return fn(request, user);
  };
}
