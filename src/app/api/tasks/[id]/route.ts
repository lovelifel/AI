import { eq } from "drizzle-orm";
import { tasks } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { z } from "zod";
import { UpdateTaskStatusSchema } from "@/lib/schemas/task";
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = z.uuid().safeParse(id);

  if (!result.success) {
    return Response.json({ error: "任务 ID 不合法" }, { status: 400 });
  }
  try {
    const [deleted] = await db
      .delete(tasks)
      .where(eq(tasks.id, result.data))
      .returning({ id: tasks.id });

    if (!deleted) {
      return Response.json({ error: "任务不存在" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return Response.json(
      { error: "删除任务失败，请稍后重试" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求体必须是合法 JSON" }, { status: 400 });
  }
  const result = z.uuid().safeParse(id);
  if (!result.success) {
    return Response.json({ error: "任务 ID 不合法" }, { status: 400 });
  }

  const input = UpdateTaskStatusSchema.safeParse(body);
  if (!input.success) {
    return Response.json({ error: "状态参数不合法" }, { status: 400 });
  }

  try {
    const [task] = await db
      .update(tasks)
      .set({ status: input.data.status })
      .where(eq(tasks.id, id))
      .returning({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
      });

    if (!task) {
      return Response.json({ error: "任务不存在" }, { status: 404 });
    }

    return Response.json({ task }, { status: 200 });
  } catch {
    return Response.json(
      { error: "更新任务状态失败，请稍后重试" },
      { status: 500 },
    );
  }
}
