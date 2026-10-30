import type { Task } from "@/types/task";
import {
  ApiErrorSchema,
  CreateTaskResponseSchema,
  ListTasksResponseSchema,
} from "@/lib/schemas/task";
export async function createTask(input: { title: string }): Promise<Task> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const failure = ApiErrorSchema.safeParse(data);
    throw new Error(
      failure.success ? failure.data.error : "添加失败，请稍后重试",
    );
  }
  const result = CreateTaskResponseSchema.safeParse(data);
  if (!result.success) {
    throw new Error("服务端返回的任务格式不正确");
  }
  return result.data.task;
}
export async function getTasks(q = "", signal?: AbortSignal): Promise<Task[]> {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  const query = params.toString();
  const response = await fetch(`/api/tasks${query ? `?${query}` : ""}`, {
    signal,
    cache: "no-store",
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = ApiErrorSchema.safeParse(data);
    throw new Error(
      failure.success ? failure.data.error : "无法获取任务列表，请稍后重试",
    );
  }
  const parsed = ListTasksResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("服务端返回的任务列表格式不正确");
  }
  return parsed.data.tasks;
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (response.status === 204) return;

  const data: unknown = await response.json().catch(() => null);
  const failure = ApiErrorSchema.safeParse(data);
  throw new Error(
    failure.success ? failure.data.error : "删除任务失败，请稍后重试",
  );
}

export async function updateTaskStatus(
  id: string,
  status: Task["status"],
): Promise<Task> {
  const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    method: "PATCH",
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = ApiErrorSchema.safeParse(data);
    throw new Error(
      failure.success ? failure.data.error : "更新失败，请稍后重试",
    );
  }
  const result = CreateTaskResponseSchema.safeParse(data);
  if (!result.success) {
    throw new Error("服务端返回的任务格式不正确");
  }
  return result.data.task;
}
