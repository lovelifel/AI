import { CreateTaskRequestSchema } from "@/lib/schemas/task";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

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

export async function GET() {
  try {
    const taskList = await db
      .select({ id: tasks.id, title: tasks.title, status: tasks.status })
      .from(tasks)
      .orderBy(asc(tasks.createdAt), asc(tasks.id));

    return Response.json({ tasks: taskList });
  } catch {
    return Response.json(
      { error: "读取任务失败，请稍后重试" },
      { status: 500 },
    );
  }
}
