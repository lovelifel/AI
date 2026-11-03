import {
  CreateTaskRequestSchema,
  TaskListQuerySchema,
} from "@/lib/schemas/task";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { listTasksPage } from "@/lib/server/tasks";
import { getCurrentUser } from "@/lib/server/session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求体必须是合法 JSON" }, { status: 400 });
  }
  const result = CreateTaskRequestSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: result.error.issues[0]?.message ?? "请求参数不合法" },
      { status: 400 },
    );
  }

  try {
    const [task] = await db
      .insert(tasks)
      .values({ title: result.data.title })
      .returning({ id: tasks.id, title: tasks.title, status: tasks.status });

    if (!task) {
      throw new Error("插入任务未返回记录");
    }

    return Response.json({ task }, { status: 201 });
  } catch {
    return Response.json(
      { error: "保存任务失败，请稍后重试" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const input = TaskListQuerySchema.safeParse({
    q: new URL(request.url).searchParams.get("q") ?? "",
    page: searchParams.get("page") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });
  if (!input.success) {
    return Response.json(
      { error: input.error.issues[0]?.message ?? "搜索参数不合法" },
      { status: 400 },
    );
  }

  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "请先登录" }, { status: 401 });
    }
    const result = await listTasksPage(
      input.data.q,
      input.data.page,
      input.data.status,
    );
    return Response.json(result);
  } catch {
    return Response.json(
      { error: "读取任务失败，请稍后重试" },
      { status: 500 },
    );
  }
}
