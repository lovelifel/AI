import type { Task } from "@/types/task";
import { ApiErrorSchema, CreateTaskResponseSchema, ListTasksResponseSchema } from "@/lib/schemas/task";
export async function createTask(
    input: { title: string },
): Promise<Task> {
    const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const failure = ApiErrorSchema.safeParse(data);
        throw new Error(failure.success ? failure.data.error : "添加失败，请稍后重试");
    }
    const result = CreateTaskResponseSchema.safeParse(data);
    if (!result.success) {
        throw new Error("服务端返回的任务格式不正确");
    }
    return result.data.task;
}
export async function getTasks() {
    const response = await fetch("/api/tasks");
    if (!response.ok) throw new Error("无法获取任务列表");
    const data = await response.json();
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
    throw new Error(failure.success ? failure.data.error : "删除任务失败，请稍后重试");
}
